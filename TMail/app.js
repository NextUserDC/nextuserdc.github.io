(() => {
  const API = 'https://api.nextuser.lat';

  // ===== PASSWORD GATE =====
  const _pepper = atob('REDACTED_TMAIL_PEPPER_B64').split('').reverse().join('');
  const _hash = 'REDACTED_TMAIL_HASH';

  async function hashPassword(pw) {
    const enc = new TextEncoder();
    const data = enc.encode(pw + _pepper);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function verifyPassword(pw) {
    const h = await hashPassword(pw);
    return h === _hash;
  }

  // ===== DOM =====
  const loginGate = document.getElementById('login-gate');
  const loginPassword = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const app = document.getElementById('app');

  const generateBtn = document.getElementById('generate-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const emailPlaceholder = document.getElementById('email-placeholder');
  const emailAddress = document.getElementById('email-address');
  const emailText = document.getElementById('email-text');
  const copyBtn = document.getElementById('copy-btn');
  const emailTimer = document.getElementById('email-timer');
  const timerText = document.getElementById('timer-text');
  const modeRandom = document.getElementById('mode-random');
  const modeCustom = document.getElementById('mode-custom');
  const customName = document.getElementById('custom-name');
  const emailSuffix = document.getElementById('email-suffix');
  const inboxSection = document.getElementById('inbox-section');
  const inboxList = document.getElementById('inbox-list');
  const inboxEmpty = document.getElementById('inbox-empty');
  const inboxCount = document.getElementById('inbox-count');
  const viewer = document.getElementById('email-viewer');
  const viewerDate = document.getElementById('viewer-date');
  const viewerFrom = document.getElementById('viewer-from');
  const viewerSubject = document.getElementById('viewer-subject');
  const viewerBody = document.getElementById('viewer-body');
  const backBtn = document.getElementById('back-btn');
  const replyBtn = document.getElementById('reply-btn');
  const composeBtn = document.getElementById('compose-btn');
  const composeModal = document.getElementById('compose-modal');
  const composeClose = document.getElementById('compose-close');
  const composeFrom = document.getElementById('compose-from');
  const composeTo = document.getElementById('compose-to');
  const composeSubject = document.getElementById('compose-subject');
  const composeBody = document.getElementById('compose-body');
  const composeSend = document.getElementById('compose-send');
  const composeStatus = document.getElementById('compose-status');
  const composeTitle = document.getElementById('compose-title');

  let currentAddress = null;
  let endAt = null;
  let pollInterval = null;
  let timerInterval = null;
  let seenIds = new Set();
  let isCustomMode = false;

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // ===== LOGIN =====
  async function doLogin() {
    const pw = loginPassword.value.trim();
    if (!pw) return;

    loginBtn.disabled = true;
    loginBtn.textContent = '...';

    const ok = await verifyPassword(pw);
    if (ok) {
      localStorage.setItem('tmail_auth', String(Date.now() + 15 * 60 * 1000));
      hide(loginGate);
      show(app);
      restoreSession();
    } else {
      loginError.textContent = 'Contrasena incorrecta';
      loginPassword.value = '';
      loginPassword.focus();
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
  }

  loginBtn.addEventListener('click', doLogin);
  loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  // ===== INIT =====
  const _authUntil = parseInt(localStorage.getItem('tmail_auth'), 10);
  if (_authUntil && Date.now() < _authUntil) {
    hide(loginGate);
    show(app);
    restoreSession();
  } else {
    localStorage.removeItem('tmail_auth');
  }

  // ===== CUSTOM NAME TOGGLE =====
  modeRandom.addEventListener('click', () => {
    isCustomMode = false;
    modeRandom.classList.add('active');
    modeCustom.classList.remove('active');
    customName.classList.remove('visible');
    emailSuffix.classList.remove('visible');
    customName.value = '';
  });

  modeCustom.addEventListener('click', () => {
    isCustomMode = true;
    modeCustom.classList.add('active');
    modeRandom.classList.remove('active');
    customName.classList.add('visible');
    emailSuffix.classList.add('visible');
    customName.focus();
  });

  // ===== API CALLS =====
  async function apiCall(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    return res.json();
  }

  // ===== GENERATE =====
  async function generate() {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generando...';

    try {
      let payload = {};
      if (isCustomMode && customName.value.trim()) {
        payload.username = customName.value.trim();
      }

      const { data } = await apiCall('POST', '/api/generate', payload);
      currentAddress = data.address;
      endAt = new Date(data.endAt).getTime();

      localStorage.setItem('tmail_address', currentAddress);
      localStorage.setItem('tmail_endAt', String(endAt));

      emailText.textContent = currentAddress;
      hide(emailPlaceholder);
      show(emailAddress);
      show(emailTimer);
      show(deleteBtn);
      inboxEmpty.textContent = 'Esperando correos...';
      inboxList.innerHTML = '';
      inboxCount.textContent = '0';
      generateBtn.textContent = 'Nueva direccion';

      startTimer();
      startPolling();
    } catch (e) {
      console.error('Generate error:', e);
    } finally {
      generateBtn.disabled = false;
    }
  }

  // ===== RESTORE SESSION =====
  function restoreSession() {
    const savedAddress = localStorage.getItem('tmail_address');
    const savedEndAt = localStorage.getItem('tmail_endAt');

    if (savedAddress && savedEndAt) {
      const now = Date.now();
      const end = parseInt(savedEndAt, 10);

      if (end > now) {
        currentAddress = savedAddress;
        endAt = end;
        emailText.textContent = currentAddress;
        hide(emailPlaceholder);
        show(emailAddress);
        show(emailTimer);
        show(deleteBtn);
        generateBtn.textContent = 'Nueva direccion';
        startTimer();
        startPolling();
        return;
      }
    }
    clearSession();
  }

  function clearSession() {
    currentAddress = null;
    endAt = null;
    seenIds = new Set();
    if (pollInterval) clearInterval(pollInterval);
    if (timerInterval) clearInterval(timerInterval);
    localStorage.removeItem('tmail_address');
    localStorage.removeItem('tmail_endAt');
  }

  // ===== TIMER =====
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    const remaining = endAt - Date.now();
    if (remaining <= 0) {
      timerText.textContent = '00:00:00';
      clearInterval(timerInterval);
      clearSession();
      show(emailPlaceholder);
      hide(emailAddress);
      hide(emailTimer);
      hide(deleteBtn);
      generateBtn.textContent = 'Generar direccion';
      return;
    }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    timerText.textContent =
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0');
  }

  // ===== POLLING =====
  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    seenIds = new Set();
    fetchInbox();
    pollInterval = setInterval(fetchInbox, 5000);
  }

  async function fetchInbox() {
    if (!currentAddress) return;
    try {
      const { data } = await apiCall('GET', `/api/inbox/${encodeURIComponent(currentAddress)}`);
      const rows = data.rows || [];

      inboxCount.textContent = rows.length;

      if (rows.length === 0) {
        inboxEmpty.textContent = 'Esperando correos...';
        inboxEmpty.classList.remove('hidden');
        return;
      }

      inboxEmpty.classList.add('hidden');

      rows.forEach((row, i) => {
        let item = document.getElementById(`msg-${row.id}`);
        if (!item) {
          item = document.createElement('div');
          item.id = `msg-${row.id}`;
          item.className = 'inbox-item';
          item.style.animationDelay = `${i * 0.05}s`;
          item.innerHTML = `
            <img class="inbox-item-avatar" src="/favicon.svg" alt="">
            <div class="inbox-item-content">
              <span class="inbox-item-from">${esc(row.from)}</span>
              <span class="inbox-item-subject">${esc(row.subject)}</span>
            </div>
            <span class="inbox-item-date">${formatDate(row.date)}</span>
          `;
          item.addEventListener('click', () => openMessage(row.id));
          inboxList.appendChild(item);
        }

        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          item.style.animation = 'none';
          item.offsetHeight;
          item.style.animation = 'fadeIn 0.4s ease-out backwards';
          item.style.animationDelay = '0s';
        }
      });
    } catch (e) {
      console.error('Inbox error:', e);
    }
  }

  // ===== COMPOSE / REPLY =====
  function openCompose(opts = {}) {
    composeFrom.innerHTML = `<img class="viewer-avatar" src="/favicon.svg" alt=""> ${esc(currentAddress || '')}`;
    composeTo.value = opts.to || '';
    composeSubject.value = opts.subject || '';
    composeBody.value = opts.body || '';
    composeTitle.textContent = opts.title || 'Redactar correo';
    composeStatus.classList.add('hidden');
    composeStatus.textContent = '';
    show(composeModal);
    composeTo.focus();
  }

  function closeCompose() {
    hide(composeModal);
    composeTo.value = '';
    composeSubject.value = '';
    composeBody.value = '';
    composeStatus.classList.add('hidden');
  }

  async function sendEmail() {
    const to = composeTo.value.trim();
    const subject = composeSubject.value.trim();
    const body = composeBody.value.trim();

    if (!to) { composeTo.focus(); return; }
    if (!subject) { composeSubject.focus(); return; }
    if (!body) { composeBody.focus(); return; }

    composeSend.disabled = true;
    composeSend.innerHTML = '<span class="spinner"></span> Enviando...';
    composeStatus.classList.add('hidden');

    try {
      const payload = {
        from: currentAddress,
        to,
        subject,
        text: body,
      };

      const { code, error } = await apiCall('POST', '/api/send', payload);

      if (code === 0) {
        composeStatus.textContent = 'Correo enviado exitosamente';
        composeStatus.className = 'compose-status success';
        composeBody.value = '';
        setTimeout(closeCompose, 2000);
      } else {
        composeStatus.textContent = error || 'Error al enviar';
        composeStatus.className = 'compose-status error';
      }
    } catch (e) {
      composeStatus.textContent = 'Error de conexion';
      composeStatus.className = 'compose-status error';
    } finally {
      composeSend.disabled = false;
      composeSend.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar';
    }
  }

  let lastViewerFrom = '';
  let lastViewerSubject = '';

  async function openMessage(id) {
    try {
      const { data } = await apiCall('GET', `/api/message/${id}`);
      viewerFrom.innerHTML = `<img class="viewer-avatar" src="/favicon.svg" alt=""> <span>De: ${esc(data.from)}</span>`;
      viewerSubject.textContent = data.subject;
      viewerDate.textContent = formatDate(data.date);
      viewerBody.innerHTML = data.html || (data.text ? esc(data.text).replace(/\n/g, '<br>') : '(sin contenido)');
      lastViewerFrom = data.from || '';
      lastViewerSubject = data.subject || '';

      hide(document.querySelector('.email-section'));
      show(viewer);
    } catch (e) {
      console.error('Message error:', e);
    }
  }

  function closeViewer() {
    hide(viewer);
    show(document.querySelector('.email-section'));
  }

  // ===== DELETE =====
  async function deleteMailbox() {
    if (!currentAddress) return;
    if (!confirm('Eliminar este buzon y todos sus correos?')) return;

    try {
      await apiCall('DELETE', `/api/mailbox/${encodeURIComponent(currentAddress)}`);
    } catch (e) {}

    clearSession();
    inboxList.innerHTML = '';
    inboxCount.textContent = '0';
    inboxEmpty.textContent = 'Genera una direccion para comenzar';
    emailText.textContent = '';
    show(emailPlaceholder);
    hide(emailAddress);
    hide(emailTimer);
    hide(deleteBtn);
    generateBtn.textContent = 'Generar direccion';
  }

  // ===== COPY =====
  function copyEmail() {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress).then(() => {
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 1500);
    });
  }

  // ===== HELPERS =====
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ===== EVENTS =====
  generateBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copyEmail);
  deleteBtn.addEventListener('click', deleteMailbox);
  backBtn.addEventListener('click', closeViewer);
  composeBtn.addEventListener('click', () => openCompose());
  composeClose.addEventListener('click', closeCompose);
  composeSend.addEventListener('click', sendEmail);
  replyBtn.addEventListener('click', () => {
    openCompose({
      to: lastViewerFrom,
      subject: lastViewerSubject.startsWith('Re: ') ? lastViewerSubject : `Re: ${lastViewerSubject}`,
      title: 'Responder correo',
    });
  });

  customName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });

  customName.addEventListener('input', () => {
    customName.value = customName.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  });
})();
