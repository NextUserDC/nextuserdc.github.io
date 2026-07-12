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
    return (await hashPassword(pw)) === _hash;
  }

  // ===== HTML SANITIZER (XSS Prevention) =====
  function sanitizeHtml(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'link'];
    const dangerousAttrs = /^on\w+$/i;
    const dangerousProtocols = /^javascript:/i;

    function walk(node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === 1) {
          const tag = child.tagName.toLowerCase();
          if (dangerousTags.includes(tag)) {
            child.remove();
            continue;
          }
          for (const attr of Array.from(child.attributes)) {
            if (dangerousAttrs.test(attr.name)) {
              child.removeAttribute(attr.name);
            } else if ((attr.name === 'href' || attr.name === 'src' || attr.name === 'action') && dangerousProtocols.test(attr.value)) {
              child.removeAttribute(attr.name);
            } else if (attr.name === 'style' && /expression\s*\(/i.test(attr.value)) {
              child.removeAttribute(attr.name);
            }
          }
          walk(child);
        }
      }
    }
    walk(doc.body);
    return doc.body.innerHTML;
  }

  // ===== LOCALSTORAGE INTEGRITY =====
  const _hmacKey = 'REDACTED_TMAIL_HMAC_KEY';

  async function _computeHmac(value) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(_hmacKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function storeSecure(key, value) {
    const hmac = await _computeHmac(value);
    localStorage.setItem(key, value);
    localStorage.setItem(key + '_h', hmac);
  }

  async function readSecure(key) {
    const value = localStorage.getItem(key);
    const storedHmac = localStorage.getItem(key + '_h');
    if (!value || !storedHmac) return null;
    const computed = await _computeHmac(value);
    if (computed !== storedHmac) {
      localStorage.removeItem(key);
      localStorage.removeItem(key + '_h');
      return null;
    }
    return value;
  }

  function clearSecure(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_h');
  }

  // ===== DOM (Cached) =====
  const $ = id => document.getElementById(id);
  const loginGate = $('login-gate');
  const loginPassword = $('login-password');
  const loginBtn = $('login-btn');
  const loginError = $('login-error');
  const app = $('app');

  const generateBtn = $('generate-btn');
  const deleteBtn = $('delete-btn');
  const extendBtn = $('extend-btn');
  const actionBtns = $('action-btns');
  const emailPlaceholder = $('email-placeholder');
  const emailAddress = $('email-address');
  const emailText = $('email-text');
  const copyBtn = $('copy-btn');
  const emailTimer = $('email-timer');
  const timerText = $('timer-text');
  const modeRandom = $('mode-random');
  const modeCustom = $('mode-custom');
  const customName = $('custom-name');
  const emailSuffix = $('email-suffix');
  const durationToggle = $('duration-toggle');
  const tokenDisplay = $('token-display');
  const tokenText = $('token-text');
  const tokenCopyBtn = $('token-copy-btn');
  const connectLinkBtn = $('connect-link-btn');
  const connectModal = $('connect-modal');
  const connectClose = $('connect-close');
  const connectTokenInput = $('connect-token-input');
  const connectError = $('connect-error');
  const connectSubmitBtn = $('connect-submit-btn');
  const connectCancelBtn = $('connect-cancel-btn');
  const extendModal = $('extend-modal');
  const extendClose = $('extend-close');
  const extendError = $('extend-error');
  const inboxSection = $('inbox-section');
  const inboxList = $('inbox-list');
  const inboxEmpty = $('inbox-empty');
  const inboxCount = $('inbox-count');
  const viewer = $('email-viewer');
  const viewerDate = $('viewer-date');
  const viewerFrom = $('viewer-from');
  const viewerSubject = $('viewer-subject');
  const viewerBody = $('viewer-body');
  const backBtn = $('back-btn');
  const replyBtn = $('reply-btn');
  const composeBtn = $('compose-btn');
  const composeModal = $('compose-modal');
  const composeClose = $('compose-close');
  const composeFrom = $('compose-from');
  const composeTo = $('compose-to');
  const composeSubject = $('compose-subject');
  const composeBody = $('compose-body');
  const composeSend = $('compose-send');
  const composeStatus = $('compose-status');
  const composeTitle = $('compose-title');

  // Cached frequently-queried elements
  const customSection = document.querySelector('.custom-section');
  const emailSection = document.querySelector('.email-section');

  let currentAddress = null;
  let currentSecret = null;
  let endAt = null;
  let pollInterval = null;
  let timerInterval = null;
  let seenIds = new Set();
  let isCustomMode = false;
  let selectedHours = 24;
  let tokenRevealed = false;
  let isPaused = false;

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
    durationToggle.classList.remove('visible');
    customName.value = '';
  });

  modeCustom.addEventListener('click', () => {
    isCustomMode = true;
    modeCustom.classList.add('active');
    modeRandom.classList.remove('active');
    customName.classList.add('visible');
    emailSuffix.classList.add('visible');
    durationToggle.classList.add('visible');
    customName.focus();
  });

  // ===== DURATION TOGGLE =====
  durationToggle.querySelectorAll('.dur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      durationToggle.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedHours = parseInt(btn.dataset.hours, 10);
    });
  });

  // ===== API CALLS (with res.ok check + secret support) =====
  async function apiCall(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { code: res.status, error: err.error || 'Error del servidor', data: null };
    }
    return res.json();
  }

  function inboxPath() {
    const sep = currentSecret ? (currentAddress.includes('?') ? '&' : '?') : '';
    return `/api/inbox/${encodeURIComponent(currentAddress)}${currentSecret ? `${sep}secret=${encodeURIComponent(currentSecret)}` : ''}`;
  }

  function messagePath(id) {
    const sep = currentSecret ? '?' : '';
    return `/api/message/${id}${currentSecret ? `${sep}secret=${encodeURIComponent(currentSecret)}` : ''}`;
  }

  // ===== TOKEN DISPLAY =====
  function maskToken(secret) {
    if (!secret || secret.length < 10) return secret;
    return secret.slice(0, 6) + '...' + secret.slice(-4);
  }

  function updateTokenDisplay() {
    if (currentSecret) {
      tokenText.textContent = tokenRevealed ? currentSecret : maskToken(currentSecret);
      show(tokenDisplay);
    } else {
      hide(tokenDisplay);
    }
  }

  tokenText.addEventListener('click', () => {
    tokenRevealed = !tokenRevealed;
    updateTokenDisplay();
  });

  tokenCopyBtn.addEventListener('click', () => {
    if (!currentSecret) return;
    navigator.clipboard.writeText(currentSecret).then(() => {
      tokenCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        tokenCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 1500);
    });
  });

  // ===== GENERATE =====
  async function generate() {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generando...';

    try {
      let payload = {};
      if (isCustomMode && customName.value.trim()) {
        payload.username = customName.value.trim();
        payload.expires_hours = selectedHours;
      }

      const { code, data, error } = await apiCall('POST', '/api/generate', payload);

      if (code !== 0) {
        if (error === 'Address already in use') {
          generateBtn.textContent = 'Direccion en uso';
          setTimeout(() => { generateBtn.textContent = 'Generar direccion'; }, 2000);
        } else {
          generateBtn.textContent = error || 'Error';
          setTimeout(() => { generateBtn.textContent = 'Generar direccion'; }, 2000);
        }
        return;
      }

      currentAddress = data.address;
      currentSecret = data.secret;
      const parsedEnd = new Date(data.endAt).getTime();
      endAt = isNaN(parsedEnd) ? Date.now() + 24 * 3600000 : parsedEnd;
      tokenRevealed = true;

      await storeSecure('tmail_address', currentAddress);
      await storeSecure('tmail_secret', currentSecret);
      await storeSecure('tmail_endAt', String(endAt));

      emailText.textContent = currentAddress;
      updateTokenDisplay();
      hide(emailPlaceholder);
      show(emailAddress);
      show(emailTimer);
      show(actionBtns);
      hide(generateBtn);
      hide(customSection);
      hide(connectLinkBtn);
      show(inboxSection);
      inboxEmpty.textContent = 'Esperando correos...';
      inboxList.innerHTML = '';
      inboxCount.textContent = '0';

      startTimer();
      startPolling();
    } catch (e) {
      console.error('Generate error:', e);
      generateBtn.textContent = 'Error de conexion';
      setTimeout(() => { generateBtn.textContent = 'Generar direccion'; }, 2000);
    } finally {
      generateBtn.disabled = false;
    }
  }

  // ===== RESTORE SESSION =====
  async function restoreSession() {
    const savedAddress = await readSecure('tmail_address');
    const savedSecret = await readSecure('tmail_secret');
    const savedEndAt = await readSecure('tmail_endAt');

    if (savedAddress && savedSecret && savedEndAt) {
      const end = parseInt(savedEndAt, 10);
      if (!isNaN(end) && end > Date.now()) {
        currentAddress = savedAddress;
        currentSecret = savedSecret;
        endAt = end;
        emailText.textContent = currentAddress;
        updateTokenDisplay();
        hide(emailPlaceholder);
        show(emailAddress);
        show(emailTimer);
        show(actionBtns);
        hide(generateBtn);
        hide(customSection);
        hide(connectLinkBtn);
        show(inboxSection);
        startTimer();
        startPolling();
        return;
      }
    }
    clearSession();
  }

  function clearSession() {
    currentAddress = null;
    currentSecret = null;
    endAt = null;
    tokenRevealed = false;
    seenIds = new Set();
    if (pollInterval) clearInterval(pollInterval);
    if (timerInterval) clearInterval(timerInterval);
    clearSecure('tmail_address');
    clearSecure('tmail_secret');
    clearSecure('tmail_endAt');
    hide(tokenDisplay);
    hide(actionBtns);
    show(generateBtn);
    show(customSection);
    show(connectLinkBtn);
    hide(inboxSection);
    hide(emailPlaceholder);
    show(emailPlaceholder);
    hide(emailAddress);
    hide(emailTimer);
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

  // ===== POLLING (with visibility pause) =====
  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    seenIds = new Set();
    fetchInbox();
    pollInterval = setInterval(fetchInbox, 5000);
  }

  function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = null;
  }

  document.addEventListener('visibilitychange', () => {
    if (!currentAddress) return;
    if (document.hidden) {
      isPaused = true;
      stopPolling();
    } else if (isPaused) {
      isPaused = false;
      startPolling();
    }
  });

  async function fetchInbox() {
    if (!currentAddress) return;
    try {
      const { data, error, code } = await apiCall('GET', inboxPath());
      if (code !== 0 || !data) {
        console.error('Inbox error:', error || 'Unknown');
        return;
      }
      const rows = data.rows || [];

      // Validate and update real expires_at from DB
      if (data.expiresAt) {
        const realEnd = new Date(data.expiresAt).getTime();
        if (!isNaN(realEnd) && realEnd !== endAt) {
          endAt = realEnd;
          await storeSecure('tmail_endAt', String(endAt));
        }
      }

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

          const dir = row.direction || 'inbox';
          const dirClass = dir === 'sent' ? 'inbox-item-sent' : (row.subject && row.subject.startsWith('Re:') ? 'inbox-item-reply' : 'inbox-item-inbox');

          item.className = `inbox-item ${dirClass}`;
          item.style.animationDelay = `${i * 0.05}s`;

          const dirIcon = dir === 'sent'
            ? '<svg class="inbox-dir-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>'
            : '<svg class="inbox-dir-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';

          item.innerHTML = `
            <div class="inbox-item-avatar-wrap">
              <img class="inbox-item-avatar" src="/favicon.svg" alt="">
              <span class="inbox-dir-badge">${dirIcon}</span>
            </div>
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function sendEmail() {
    const to = composeTo.value.trim();
    const subject = composeSubject.value.trim();
    const body = composeBody.value.trim();
    if (!to) { composeTo.focus(); return; }
    if (!EMAIL_REGEX.test(to)) { composeStatus.textContent = 'Email invalido'; composeStatus.className = 'compose-status error'; composeStatus.classList.remove('hidden'); composeTo.focus(); return; }
    if (!subject) { composeSubject.focus(); return; }
    if (!body) { composeBody.focus(); return; }

    composeSend.disabled = true;
    composeSend.innerHTML = '<span class="spinner"></span> Enviando...';
    composeStatus.classList.add('hidden');

    try {
      const { code, error } = await apiCall('POST', '/api/send', {
        from: currentAddress, to, subject, text: body,
      });

      if (code === 0) {
        composeStatus.textContent = 'Correo enviado exitosamente';
        composeStatus.className = 'compose-status success';
        composeBody.value = '';
        setTimeout(closeCompose, 2000);
        setTimeout(fetchInbox, 1000);
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
      const { data, error, code } = await apiCall('GET', messagePath(id));
      if (code !== 0 || !data) {
        console.error('Message error:', error || 'Unknown');
        return;
      }
      viewerFrom.innerHTML = `<img class="viewer-avatar" src="/favicon.svg" alt=""> <span>De: ${esc(data.from)}</span>`;
      viewerSubject.textContent = data.subject;
      viewerDate.textContent = formatDate(data.date);
      // Sanitize HTML to prevent XSS
      viewerBody.innerHTML = data.html ? sanitizeHtml(data.html) : (data.text ? esc(data.text).replace(/\n/g, '<br>') : '(sin contenido)');
      lastViewerFrom = data.from || '';
      lastViewerSubject = data.subject || '';

      hide(emailSection);
      hide(inboxSection);
      show(viewer);
    } catch (e) {
      console.error('Message error:', e);
    }
  }

  function closeViewer() {
    hide(viewer);
    show(emailSection);
    show(inboxSection);
  }

  // ===== DELETE (with error feedback) =====
  async function deleteMailbox() {
    if (!currentAddress || !currentSecret) return;
    if (!confirm('Eliminar este buzon y todos sus correos?')) return;

    try {
      const result = await apiCall('DELETE', `/api/mailbox/${encodeURIComponent(currentAddress)}`, { secret: currentSecret });
      if (result.code !== 0) {
        alert('Error al eliminar: ' + (result.error || 'Error desconocido'));
        return;
      }
    } catch (e) {
      alert('Error de conexion al eliminar');
      return;
    }

    clearSession();
    inboxList.innerHTML = '';
    inboxCount.textContent = '0';
    inboxEmpty.textContent = 'Genera una direccion para comenzar';
    emailText.textContent = '';
    generateBtn.textContent = 'Generar direccion';
  }

  // ===== CONNECT =====
  function openConnectModal() {
    connectTokenInput.value = '';
    connectError.textContent = '';
    show(connectModal);
    connectTokenInput.focus();
  }

  function closeConnectModal() {
    hide(connectModal);
    connectTokenInput.value = '';
    connectError.textContent = '';
  }

  async function connectWithToken() {
    const token = connectTokenInput.value.trim();
    if (!token) { connectError.textContent = 'Ingresa un token valido'; return; }

    connectSubmitBtn.disabled = true;
    connectSubmitBtn.textContent = 'Conectando...';
    connectError.textContent = '';

    try {
      const { code, data, error } = await apiCall('POST', '/api/connect', { secret: token });

      if (code !== 0) {
        connectError.textContent = error || 'Token invalido';
        return;
      }

      if (!data || !data.address || !data.secret) {
        connectError.textContent = 'Respuesta invalida del servidor';
        return;
      }

      currentAddress = data.address;
      currentSecret = data.secret;
      const parsedEnd = new Date(data.expiresAt).getTime();
      endAt = isNaN(parsedEnd) ? Date.now() + 24 * 3600000 : parsedEnd;
      tokenRevealed = false;

      await storeSecure('tmail_address', currentAddress);
      await storeSecure('tmail_secret', currentSecret);
      await storeSecure('tmail_endAt', String(endAt));

      emailText.textContent = currentAddress;
      updateTokenDisplay();
      hide(emailPlaceholder);
      show(emailAddress);
      show(emailTimer);
      show(actionBtns);
      hide(generateBtn);
      hide(customSection);
      hide(connectLinkBtn);
      show(inboxSection);
      generateBtn.textContent = 'Nueva direccion';
      inboxEmpty.textContent = 'Esperando correos...';
      inboxList.innerHTML = '';
      inboxCount.textContent = '0';

      startTimer();
      startPolling();
      closeConnectModal();
    } catch (e) {
      connectError.textContent = 'Error de conexion';
    } finally {
      connectSubmitBtn.disabled = false;
      connectSubmitBtn.textContent = 'Conectar';
    }
  }

  // ===== EXTEND =====
  function openExtendModal() {
    extendError.textContent = '';
    show(extendModal);
  }

  function closeExtendModal() {
    hide(extendModal);
  }

  async function extendMailbox(hours) {
    if (!currentAddress || !currentSecret) return;

    try {
      const { code, data, error } = await apiCall('POST', '/api/extend', {
        address: currentAddress,
        secret: currentSecret,
        hours,
      });

      if (code !== 0) {
        extendError.textContent = error || 'Error al extender';
        return;
      }

      const parsedEnd = new Date(data.expiresAt).getTime();
      if (!isNaN(parsedEnd)) {
        endAt = parsedEnd;
        await storeSecure('tmail_endAt', String(endAt));
      }
      startTimer();
      closeExtendModal();
    } catch (e) {
      extendError.textContent = 'Error de conexion';
    }
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
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ===== EVENTS =====
  generateBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copyEmail);
  deleteBtn.addEventListener('click', deleteMailbox);
  extendBtn.addEventListener('click', openExtendModal);
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

  // Connect modal
  connectLinkBtn.addEventListener('click', openConnectModal);
  connectClose.addEventListener('click', closeConnectModal);
  connectCancelBtn.addEventListener('click', closeConnectModal);
  connectSubmitBtn.addEventListener('click', connectWithToken);
  connectTokenInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') connectWithToken(); });
  connectModal.addEventListener('click', (e) => { if (e.target === connectModal) closeConnectModal(); });

  // Extend modal
  extendClose.addEventListener('click', closeExtendModal);
  extendModal.addEventListener('click', (e) => { if (e.target === extendModal) closeExtendModal(); });
  extendModal.querySelectorAll('.extend-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      extendMailbox(parseInt(btn.dataset.hours, 10));
    });
  });
})();
