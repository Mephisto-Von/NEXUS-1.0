use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use aes_gcm::aead::{Aead, Key};
use chacha20poly1305::ChaCha20Poly1305;
use argon2::{Argon2, Version, Params};
use argon2::password_hash::SaltString;
use rand::RngCore;
use zeroize::Zeroize;
use secrecy::{Secret, SecretString, ExposeSecret};
use sha2::{Sha256, Digest};
use std::path::PathBuf;
use std::fs;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SecurityError {
    #[error("Encryption failed: {0}")]
    Encryption(String),
    #[error("Decryption failed: {0}")]
    Decryption(String),
    #[error("Key derivation failed: {0}")]
    KeyDerivation(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Secure wipe failed: {0}")]
    Wipe(String),
}

pub struct EncryptionKey {
    key: Secret<Vec<u8>>,
}

impl EncryptionKey {
    pub fn expose(&self) -> &[u8] {
        self.key.expose_secret()
    }
}

impl Drop for EncryptionKey {
    fn drop(&mut self) {
        self.key.expose_secret().zeroize();
    }
}

pub struct SecurityManager {
    master_key: EncryptionKey,
    data_dir: PathBuf,
    secure_dir: PathBuf,
}

impl SecurityManager {
    pub fn new() -> Result<Self, SecurityError> {
        let base_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("nexus1");

        let data_dir = base_dir.join("data");
        let secure_dir = base_dir.join("secure");

        fs::create_dir_all(&data_dir)?;
        fs::create_dir_all(&secure_dir)?;

        let master_key = Self::derive_or_load_key(&secure_dir)?;

        Ok(Self {
            master_key,
            data_dir,
            secure_dir,
        })
    }

    fn derive_or_load_key(secure_dir: &PathBuf) -> Result<EncryptionKey, SecurityError> {
        let key_path = secure_dir.join("master.key");

        if key_path.exists() {
            let encrypted = fs::read(&key_path)?;
            let password = Self::get_or_create_password(secure_dir)?;
            let key = Self::decrypt_key(&encrypted, &password)?;
            Ok(EncryptionKey { key: Secret::new(key) })
        } else {
            let mut key = vec![0u8; 32];
            rand::thread_rng().fill_bytes(&mut key);
            let password = Self::get_or_create_password(secure_dir)?;
            let encrypted = Self::encrypt_key(&key, &password)?;
            fs::write(&key_path, encrypted)?;
            Ok(EncryptionKey { key: Secret::new(key) })
        }
    }

    fn get_or_create_password(secure_dir: &PathBuf) -> Result<SecretString, SecurityError> {
        let pass_path = secure_dir.join(".passphrase");
        if pass_path.exists() {
            let content = fs::read_to_string(&pass_path)?;
            Ok(SecretString::new(content))
        } else {
            let mut passphrase = String::with_capacity(64);
            for _ in 0..8 {
                let byte = rand::random::<u8>();
                passphrase.push_str(&format!("{:02x}", byte));
            }
            fs::write(&pass_path, &passphrase)?;
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let mut perms = fs::metadata(&pass_path)?.permissions();
                perms.set_mode(0o600);
                fs::set_permissions(&pass_path, perms)?;
            }
            Ok(SecretString::new(passphrase))
        }
    }

    pub fn encrypt_data(&self, plaintext: &[u8]) -> Result<Vec<u8>, SecurityError> {
        let key = Key::<Aes256Gcm>::from_slice(self.master_key.expose());
        let cipher = Aes256Gcm::new(key);
        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher.encrypt(nonce, plaintext)
            .map_err(|e| SecurityError::Encryption(e.to_string()))?;

        let mut result = Vec::with_capacity(12 + ciphertext.len());
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    pub fn decrypt_data(&self, ciphertext: &[u8]) -> Result<Vec<u8>, SecurityError> {
        if ciphertext.len() < 12 {
            return Err(SecurityError::Decryption("Ciphertext too short".into()));
        }
        let (nonce_bytes, encrypted) = ciphertext.split_at(12);
        let key = Key::<Aes256Gcm>::from_slice(self.master_key.expose());
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(nonce_bytes);

        cipher.decrypt(nonce, encrypted)
            .map_err(|e| SecurityError::Decryption(e.to_string()))
    }

    fn encrypt_key(key: &[u8], password: &SecretString) -> Result<Vec<u8>, SecurityError> {
        let salt = SaltString::generate(&mut rand::thread_rng());
        let argon2 = Argon2::new(
            argon2::Algorithm::Argon2id,
            Version::V0x13,
            Params::new(64 * 1024, 3, 1, Some(32)).unwrap(),
        );
        let hash = argon2.hash_password(password.expose_secret().as_bytes(), &salt)
            .map_err(|e| SecurityError::KeyDerivation(e.to_string()))?;

        let mut key_bytes = hash.hash.unwrap().as_bytes().to_vec();
        key_bytes.truncate(32);

        let chacha_key = chacha20poly1305::Key::from_slice(&key_bytes);
        let cipher = ChaCha20Poly1305::new(chacha_key);
        let mut nonce = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce);

        let encrypted = cipher.encrypt(nonce.as_ref().into(), key.as_ref())
            .map_err(|e| SecurityError::Encryption(e.to_string()))?;

        let mut result = salt.as_str().as_bytes().to_vec();
        result.push(b'|');
        result.extend_from_slice(&nonce);
        result.extend_from_slice(&encrypted);
        key_bytes.zeroize();
        Ok(result)
    }

    fn decrypt_key(encrypted: &[u8], password: &SecretString) -> Result<Vec<u8>, SecurityError> {
        let parts: Vec<&[u8]> = encrypted.split(|&b| b == b'|').collect();
        if parts.len() != 2 {
            return Err(SecurityError::Decryption("Invalid key format".into()));
        }
        let salt_str = std::str::from_utf8(parts[0])
            .map_err(|e| SecurityError::Decryption(e.to_string()))?;
        let salt = SaltString::from_b64(salt_str)
            .map_err(|e| SecurityError::Decryption(e.to_string()))?;
        let rest = parts[1];
        let (nonce, ciphertext) = rest.split_at(12);

        let argon2 = Argon2::new(
            argon2::Algorithm::Argon2id,
            Version::V0x13,
            Params::new(64 * 1024, 3, 1, Some(32)).unwrap(),
        );
        let hash = argon2.hash_password(password.expose_secret().as_bytes(), &salt.salt())
            .map_err(|e| SecurityError::KeyDerivation(e.to_string()))?;

        let mut key_bytes = hash.hash.unwrap().as_bytes().to_vec();
        key_bytes.truncate(32);

        let chacha_key = chacha20poly1305::Key::from_slice(&key_bytes);
        let cipher = ChaCha20Poly1305::new(chacha_key);

        let decrypted = cipher.decrypt(nonce.into(), ciphertext)
            .map_err(|e| SecurityError::Decryption(e.to_string()))?;

        key_bytes.zeroize();
        Ok(decrypted)
    }

    pub fn secure_wipe(&self) -> Result<(), SecurityError> {
        if self.secure_dir.exists() {
            for entry in fs::read_dir(&self.secure_dir)? {
                let path = entry?.path();
                if path.is_file() {
                    self.overwrite_file(&path)?;
                    fs::remove_file(&path)?;
                }
            }
        }
        if self.data_dir.exists() {
            for entry in fs::read_dir(&self.data_dir)? {
                let path = entry?.path();
                if path.is_file() {
                    self.overwrite_file(&path)?;
                    fs::remove_file(&path)?;
                }
            }
        }
        Ok(())
    }

    fn overwrite_file(&self, path: &PathBuf) -> Result<(), SecurityError> {
        let metadata = fs::metadata(path)?;
        let size = metadata.len();
        let mut file = fs::OpenOptions::new().write(true).open(path)?;
        let mut buffer = vec![0u8; size as usize];
        rand::thread_rng().fill_bytes(&mut buffer);
        std::io::Write::write_all(&mut file, &buffer)?;
        file.sync_all()?;
        buffer.zeroize();
        Ok(())
    }

    pub fn data_dir(&self) -> String {
        self.data_dir.to_string_lossy().to_string()
    }

    pub fn hash_data(&self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hasher.update(self.master_key.expose());
        hex::encode(hasher.finalize())
    }
}
