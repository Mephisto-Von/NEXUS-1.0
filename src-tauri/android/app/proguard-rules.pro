# NEXUS 1.0 ProGuard Rules
# Keep Tauri classes
-keep class com.tauri.** { *; }
-keep class com.nexus1.** { *; }

# Keep security-related classes
-keep class * extends javax.crypto.** { *; }
-keep class org.bouncycastle.** { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Disable debugging
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose
