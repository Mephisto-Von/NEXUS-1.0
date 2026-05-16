(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

  async function tauriInvoke(cmd, args = {}) {
    if (isTauri) {
      return window.__TAURI__.core.invoke(cmd, args);
    }
    const res = await fetch(`/api/${cmd}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    return res.json();
  }

  async function tauriGet(endpoint) {
    if (isTauri) {
      const cmd = endpoint.replace('/api/', '').replace('/', '_');
      return window.__TAURI__.core.invoke(cmd);
    }
    const res = await fetch(`/api/${endpoint}`);
    return res.json();
  }

  /* BOOT */
  const bootLog = $('#bootLog');
  const bootBar = $('#bootBar');
  const bootLines = [
    '$ NEXUS.7 v3.0 // SECURE AGENTIC PLATFORM',
    '$ initializing secure enclave...',
    '$ AES-256-GCM encryption [OK]',
    '$ Argon2id key derivation [OK]',
    '$ loading agent protocols...',
    '$ ARCHITECT ........ online',
    '$ SPECIALIST ....... online',
    '$ CRITIC ........... online',
    '$ SYNTHESIZER ...... online',
    '$ CONSENSUS ........ online',
    `${isTauri ? '$ Tauri sandbox [ACTIVE]' : '$ Browser mode [STANDARD]'}`,
    '$ connecting to Ollama...',
    '$ READY.'
  ];
  let lineIdx = 0, linesDone = false, windowLoaded = (document.readyState === 'complete'), dismissed = false;

  function refreshBar(){
    const pct = (linesDone && windowLoaded) ? 100 : Math.min(99, Math.round((lineIdx / bootLines.length) * 99));
    bootBar.style.width = pct + '%';
  }
  function nextLine(){
    if (lineIdx >= bootLines.length){ linesDone = true; refreshBar(); tryFinish(); return; }
    bootLog.textContent += (lineIdx ? '\n' : '') + bootLines[lineIdx];
    lineIdx++; refreshBar();
    setTimeout(nextLine, 80 + Math.random()*80);
  }
  setTimeout(nextLine, 100);
  if (!windowLoaded) window.addEventListener('load', () => { windowLoaded = true; tryFinish(); }, { once: true });
  function tryFinish(){
    if (dismissed || !linesDone || !windowLoaded) return;
    dismissed = true;
    setTimeout(() => { document.body.dataset.loaded = 'true'; init(); }, 300);
  }
  setTimeout(() => { if (!dismissed){ linesDone = true; windowLoaded = true; tryFinish(); } }, 10000);

  /* CURSOR */
  const cursor = $('#cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, {passive:true});
  (function cursorLoop(){
    cx += (tx - cx) * 0.35; cy += (ty - cy) * 0.35;
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  })();
  document.addEventListener('mouseenter', () => cursor.style.opacity = 1);
  document.addEventListener('mouseleave', () => cursor.style.opacity = 0);
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, textarea, .chip, .task-card, .result-card, .model-card')) cursor.classList.add('is-active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, textarea, .chip, .task-card, .result-card, .model-card')) cursor.classList.remove('is-active');
  });

  /* CLOCK */
  (function updateClock(){ $('#clock').textContent = new Date().toTimeString().slice(0,8); setTimeout(updateClock, 1000); })();

  /* STATE */
  let selectedModels = [], selectedMode = 'collaborative', allTasks = [];

  /* ACTIVITY */
  function addActivity(cls, msg){
    const feed = $('#activityFeed');
    const empty = feed.querySelector('.activity-empty');
    if (empty) empty.remove();
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `<span class="activity-item__time">${new Date().toTimeString().slice(0,8)}</span><span class="activity-item__agent ${cls}">${cls.toUpperCase()}</span><span class="activity-item__msg">${escapeHtml(msg)}</span>`;
    feed.insertBefore(item, feed.firstChild);
    while (feed.children.length > 50) feed.removeChild(feed.lastChild);
  }

  function getAgentClass(name){
    const n = name.toLowerCase();
    if (n.includes('architect')) return 'architect';
    if (n.includes('specialist')) return 'specialist';
    if (n.includes('critic')) return 'critic';
    if (n.includes('synthesizer')) return 'synthesizer';
    if (n.includes('consensus')) return 'consensus';
    return 'system';
  }

  /* TASKS */
  async function loadTasks(){
    try {
      const data = await tauriGet('tasks');
      allTasks = data.tasks || [];
      renderTasks();
    } catch {}
  }
  function renderTasks(){
    const list = $('#taskList');
    if (!allTasks.length){ list.innerHTML = '<div class="task-empty"><p>No tasks yet. Deploy agents to begin.</p></div>'; return; }
    list.innerHTML = allTasks.map(t => `
      <div class="task-card" data-id="${t.id}">
        <div>
          <div class="task-card__prompt">${escapeHtml(t.prompt)}</div>
          <div class="task-card__meta">
            <span class="task-card__status ${t.status}">${t.status.toUpperCase()}</span>
            <span class="task-card__time">${new Date(t.created_at).toLocaleTimeString()}</span>
            ${t.metrics?.duration_ms ? `<span class="task-card__time">${(t.metrics.duration_ms/1000).toFixed(1)}s</span>` : ''}
          </div>
          ${t.status === 'running' ? '<div class="progress-bar"><div class="progress-bar__fill" style="width:0%"></div></div>' : ''}
        </div>
        ${t.status === 'completed' ? `<button class="task-card__view" onclick="viewResult('${t.id}')">VIEW</button>` : ''}
      </div>
    `).join('');
  }
  function updateTaskStatus(id, status){
    const card = $(`.task-card[data-id="${id}"]`);
    if (!card) return;
    const el = card.querySelector('.task-card__status');
    if (el){ el.className = `task-card__status ${status}`; el.textContent = status.toUpperCase(); }
    if (status === 'running' && !card.querySelector('.progress-bar')){
      const bar = document.createElement('div');
      bar.className = 'progress-bar'; bar.innerHTML = '<div class="progress-bar__fill" style="width:0%"></div>';
      card.querySelector('.task-card__meta').parentNode.insertBefore(bar, card.querySelector('.task-card__meta').nextSibling);
    }
  }
  function updateTaskProgress(id, pct){
    const bar = $(`.task-card[data-id="${id}"] .progress-bar__fill`);
    if (bar) bar.style.width = pct + '%';
  }
  async function loadTask(id){
    try {
      const data = await tauriGet(`tasks/${id}`);
      const task = data.task;
      if (task && task.status === 'completed' && task.final_result) renderResult(task);
      renderTasks();
    } catch {}
  }
  window.viewResult = async function(id){ await loadTask(id); $('#results').scrollIntoView({ behavior: 'smooth' }); };

  /* RESULTS */
  function renderResult(task){
    const viewer = $('#resultViewer');
    const empty = viewer.querySelector('.result-empty');
    if (empty) empty.remove();
    const existing = viewer.querySelector(`[data-result-id="${task.id}"]`);
    if (existing) existing.remove();
    const best = task.consensus?.best || '';
    const score = task.final_result?.quality_score || 0;
    const card = document.createElement('div');
    card.className = 'result-card';
    card.dataset.resultId = task.id;
    card.innerHTML = `
      <div class="result-card__head">
        <span class="result-card__title">${escapeHtml(task.prompt.slice(0,100))}${task.prompt.length>100?'...':''}</span>
        <span class="result-card__score">QUALITY: ${(score*100).toFixed(0)}%</span>
      </div>
      <div class="result-card__body">${formatOutput(task.final_result?.content || '')}</div>
      <div class="result-card__models">
        ${(task.final_result?.all_results||[]).map(r => `<span class="result-model-tag ${r.model===best?'best':''}">${r.model} — ${(r.score*100).toFixed(0)}%</span>`).join('')}
      </div>`;
    viewer.insertBefore(card, viewer.firstChild);
  }
  function formatOutput(text){
    return escapeHtml(text)
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  /* STATS */
  async function loadStats(){
    try {
      const data = await tauriGet('stats');
      const s = data.stats || {};
      $('#statTotal').textContent = s.total || 0;
      $('#statCompleted').textContent = s.completed || 0;
      $('#statRunning').textContent = s.running || 0;
      $('#statFailed').textContent = s.failed || 0;
    } catch {}
  }

  /* OLLAMA + MODELS */
  async function checkOllama(){
    try {
      const data = await tauriGet('ollama_status');
      const icon = $('#ollamaIcon');
      const text = $('#ollamaStatus');
      if (data.running){
        icon.className = 'status-banner__icon ready';
        text.textContent = `Ollama connected — ${data.models_available} model(s) available`;
      } else {
        icon.className = 'status-banner__icon offline';
        text.textContent = 'Ollama not detected. Install from https://ollama.ai and run: ollama serve';
      }
    } catch {
      $('#ollamaIcon').className = 'status-banner__icon offline';
      $('#ollamaStatus').textContent = 'Cannot reach Ollama. Is it running on localhost:11434?';
    }
    loadModelCards();
  }

  async function loadModelCards(){
    try {
      const data = await tauriGet('models');
      const grid = $('#modelsGrid');
      const available = data.available || [];
      const all = data.all || [];
      const availableTags = new Set(available.map(m => m.tag));

      const tierOrder = { micro: 0, small: 1, 'medium-small': 2, medium: 3, specialized: 4 };
      const sorted = [...all].sort((a, b) => (tierOrder[a.tier] || 5) - (tierOrder[b.tier] || 5));

      grid.innerHTML = sorted.map(m => {
        const isAvail = availableTags.has(m.tag);
        return `
          <div class="model-card ${isAvail ? 'model-card--available' : ''}">
            <div class="model-card__head">
              <span class="model-card__name">${m.name}</span>
              <span class="model-card__badge ${isAvail ? 'model-card__badge--available' : 'model-card__badge--missing'}">${isAvail ? 'READY' : m.size}</span>
            </div>
            <div class="model-card__role">${m.role} — ${m.specialty}</div>
            <ul class="model-card__strengths">
              ${m.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
            ${!isAvail ? `<button class="model-card__pull" onclick="pullModel('${m.tag}')">PULL MODEL</button>` : ''}
          </div>`;
      }).join('');

      // Update model chips
      const chips = $('#modelChips');
      chips.innerHTML = '<button class="chip chip--active" data-model="auto">AUTO-ROUTE</button>';
      available.forEach(m => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.dataset.model = m.tag;
        chip.textContent = m.name.split(' ').slice(0,2).join(' ');
        chips.appendChild(chip);
      });

      chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const model = chip.dataset.model;
        if (model === 'auto'){
          $$('.chip', chips).forEach(c => c.classList.remove('chip--active'));
          chip.classList.add('chip--active');
          selectedModels = [];
        } else {
          $('.chip[data-model="auto"]', chips)?.classList.remove('chip--active');
          chip.classList.toggle('chip--active');
          selectedModels = $$('.chip--active[data-model]:not([data-model="auto"])', chips).map(c => c.dataset.model);
          if (!selectedModels.length) $('.chip[data-model="auto"]', chips)?.classList.add('chip--active');
        }
      });
    } catch {}
  }

  window.pullModel = async function(tag){
    const btn = event.target;
    btn.textContent = 'PULLING...';
    btn.style.pointerEvents = 'none';
    try {
      await tauriInvoke('pull_model', { model: tag });
      await checkOllama();
    } catch { btn.textContent = 'FAILED'; }
  };

  /* MODE CHIPS */
  $$('.mode-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.mode-chips .chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      selectedMode = chip.dataset.mode;
    });
  });

  /* SUBMIT */
  $('#submitTask').addEventListener('click', async () => {
    const prompt = $('#taskInput').value.trim();
    if (!prompt) return;
    $('#submitTask').disabled = true;
    $('#submitTask').querySelector('span').textContent = 'DEPLOYING...';
    try {
      const data = await tauriInvoke('create_task', {
        prompt,
        models: selectedModels,
        mode: selectedMode,
      });
      $('#taskInput').value = '';
      addActivity('system', `Task deployed: ${data.taskId.slice(0,8)}`);
      loadTasks();
    } catch (err) { addActivity('system', `Error: ${err.message || err}`); }
    $('#submitTask').disabled = false;
    $('#submitTask').querySelector('span').textContent = 'DEPLOY AGENTS';
  });

  $('#clearInput').addEventListener('click', () => { $('#taskInput').value = ''; });
  $('#ollamaRefresh').addEventListener('click', checkOllama);

  /* SECURITY INFO */
  async function loadSecurityInfo(){
    try {
      const info = await tauriGet('security_info');
      if (info.encryption) {
        addActivity('system', `Security: ${info.encryption} | Key: ${info.keyDerivation} | Sandboxed: ${info.sandboxed}`);
      }
    } catch {}
  }

  /* FOOTER LOG */
  function logFoot(msg){
    const el = $('#footLog');
    const now = new Date().toTimeString().slice(0,8);
    el.textContent = `[${now}] ${msg.slice(0,100)}`;
  }

  /* NAV */
  $$('nav a').forEach(a => {
    a.addEventListener('click', function(){ $$('nav a').forEach(x => x.classList.remove('nav__active')); this.classList.add('nav__active'); });
  });

  /* INIT */
  function init(){
    checkOllama();
    loadTasks();
    loadStats();
    loadSecurityInfo();
    logFoot('NEXUS.7 initialized — all data encrypted at rest');
  }

  function escapeHtml(str){ const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
})();
