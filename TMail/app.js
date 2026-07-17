(() => {
  const API = 'https://api.nextuser.lat';

  // ===== PASSWORD GATE (backend) =====
  async function verifyPassword(pw) {
    try {
      const res = await fetch(`${API}/api/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'tmail', password: pw }),
      });
      const data = await res.json();
      return data.code === 0 && data.data?.valid;
    } catch {
      return false;
    }
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
  const _hmacKey = 'tmail-integrity-k3y-2026';

  let _cachedHmacKey = null;
  async function _computeHmac(value) {
    if (!_cachedHmacKey) {
      const enc = new TextEncoder();
      _cachedHmacKey = await crypto.subtle.importKey('raw', enc.encode(_hmacKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    }
    const enc = new TextEncoder();
    const sig = await crypto.subtle.sign('HMAC', _cachedHmacKey, enc.encode(value));
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
  let timerInterval = null;
  let seenIds = new Set();
  let isCustomMode = false;
  let selectedHours = 24;
  let tokenRevealed = false;
  let currentIsCustom = false;
  let isPaused = false;
  let _pollTimer = null;
  let _pollDelay = 5000;

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
      tokenRevealed = false;
      currentIsCustom = isCustomMode && customName.value.trim().length > 0;

      await storeSecure('tmail_address', currentAddress);
      await storeSecure('tmail_secret', currentSecret);
      await storeSecure('tmail_endAt', String(endAt));
      await storeSecure('tmail_custom', String(currentIsCustom));

      activateSession();
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
    const savedCustom = await readSecure('tmail_custom');

    if (savedAddress && savedSecret && savedEndAt) {
      const end = parseInt(savedEndAt, 10);
      if (!isNaN(end) && end > Date.now()) {
        currentAddress = savedAddress;
        currentSecret = savedSecret;
        endAt = end;
        currentIsCustom = savedCustom === 'true';
        activateSession();
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
    currentIsCustom = false;
    seenIds = new Set();
    stopPolling();
    if (timerInterval) clearInterval(timerInterval);
    clearSecure('tmail_address');
    clearSecure('tmail_secret');
    clearSecure('tmail_endAt');
    clearSecure('tmail_custom');
    hide(tokenDisplay);
    hide(actionBtns);
    show(generateBtn);
    show(customSection);
    show(connectLinkBtn);
    hide(inboxSection);
    show(emailPlaceholder);
    hide(emailAddress);
    hide(emailTimer);
    hide(headerNav);
    hide(ncloudView);
    navTmail.classList.add('active');
    navNcloud.classList.remove('active');
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
    stopPolling();
    seenIds = new Set();
    _pollDelay = 5000;
    fetchInbox();
    function poll() {
      fetchInbox().then(() => {
        _pollTimer = setTimeout(poll, _pollDelay);
      });
    }
    _pollTimer = setTimeout(poll, _pollDelay);
  }

  function stopPolling() {
    if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
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
        // Mailbox doesn't exist in DB (cleared or expired) — clear local session
        if (code !== 0) {
          console.warn('Inbox error, clearing session:', error);
          clearSession();
          inboxList.innerHTML = '';
          inboxCount.textContent = '0';
          inboxEmpty.textContent = 'Genera una direccion para comenzar';
          emailText.textContent = '';
          generateBtn.textContent = 'Generar direccion';
        }
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
        _pollDelay = Math.min(_pollDelay + 2000, 30000);
        return;
      }

      inboxEmpty.classList.add('hidden');

      let newCount = 0;
      rows.forEach((row, i) => {
        let item = document.getElementById(`msg-${row.id}`);
        if (!item) {
          newCount++;
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
          item.classList.add('animate-in');
        }
      });

      if (newCount === 0) {
        _pollDelay = Math.min(_pollDelay + 2000, 30000);
      } else {
        _pollDelay = 5000;
      }
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
    if (!body) { composeBody.focus(); return; }

    composeSend.disabled = true;
    composeSend.innerHTML = '<span class="spinner"></span> Enviando...';
    composeStatus.classList.add('hidden');

    try {
      const { code, error } = await apiCall('POST', '/api/send', {
        address: currentAddress, secret: currentSecret, to, subject, text: body,
      });

      if (code === 0) {
        composeStatus.textContent = 'Correo enviado exitosamente';
        composeStatus.className = 'compose-status success';
        composeBody.value = '';
        setTimeout(closeCompose, 500);
        setTimeout(fetchInbox, 300);
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
        // Mailbox already gone from DB — clear local session anyway
        if (result.error && result.error.includes('not found')) {
          clearSession();
          inboxEmpty.textContent = 'Genera una direccion para comenzar';
          generateBtn.textContent = 'Generar direccion';
          return;
        }
        alert('Error al eliminar: ' + (result.error || 'Error desconocido'));
        return;
      }
    } catch (e) {
      // Connection error — still clear if user wants
      alert('Error de conexion al eliminar');
      return;
    }

    clearSession();
    inboxEmpty.textContent = 'Genera una direccion para comenzar';
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
      currentIsCustom = true;

      await storeSecure('tmail_address', currentAddress);
      await storeSecure('tmail_secret', currentSecret);
      await storeSecure('tmail_endAt', String(endAt));
      await storeSecure('tmail_custom', 'true');

      generateBtn.textContent = 'Nueva direccion';
      activateSession();
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
  const _ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => _ESC_MAP[c]);
  }

  const _SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
  const _FILE_CATEGORIES = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    doc: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
    code: ['js', 'ts', 'py', 'html', 'css', 'json', 'xml', 'rb', 'go', 'rs', 'sh']
  };

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + _SIZE_UNITS[i];
  }

  function getFileCategory(name) {
    const ext = name.split('.').pop().toLowerCase();
    for (const [cat, exts] of Object.entries(_FILE_CATEGORIES)) {
      if (exts.includes(ext)) return cat;
    }
    return 'other';
  }

  function getFileIconSvg(category) {
    const icons = {
      folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
      audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    };
    return icons[category] || icons.other;
  }

  function activateSession() {
    emailText.textContent = currentAddress;
    updateTokenDisplay();
    hide(emailPlaceholder); show(emailAddress); show(emailTimer); show(actionBtns);
    if (currentIsCustom) {
      show(tokenDisplay); show(extendBtn); show(headerNav);
    } else {
      hide(tokenDisplay); hide(extendBtn); hide(headerNav); hideNCloud();
    }
    hide(generateBtn); hide(customSection); hide(connectLinkBtn);
    show(inboxSection);
    inboxEmpty.textContent = 'Esperando correos...';
    inboxList.innerHTML = '';
    inboxCount.textContent = '0';
    startTimer();
    startPolling();
  }

  // ===== NCLOUD =====
  const headerNav = $('header-nav');
  const navTmail = $('nav-tmail');
  const navNcloud = $('nav-ncloud');
  const ncloudView = $('ncloud-view');
  const ncloudBreadcrumb = $('ncloud-breadcrumb');
  const ncloudFiles = $('ncloud-files');
  const ncloudEmpty = $('ncloud-empty');
  const ncloudDropzone = $('ncloud-dropzone');
  const ncloudFileInput = $('ncloud-file-input');
  const ncloudUploadBtn = $('ncloud-upload-btn');
  const ncloudRefreshBtn = $('ncloud-refresh');
  const ncloudSpaceBtn = $('ncloud-space-btn');
  const ncloudSpaceBar = $('ncloud-space-bar');
  const ncloudSpaceUsed = $('ncloud-space-used');
  const ncloudSpaceCount = $('ncloud-space-count');
  const ncloudSpaceFill = $('ncloud-space-fill');
  const ncloudProgress = $('ncloud-progress');
  const ncloudProgressFill = $('ncloud-progress-fill');
  const ncloudProgressText = $('ncloud-progress-text');
  const ncloudNewFolderBtn = $('ncloud-new-folder-btn');
  const ncloudShareModal = $('ncloud-share-modal');
  const ncloudShareClose = $('ncloud-share-close');
  const ncloudShareFilename = $('ncloud-share-filename');
  const ncloudShareLink = $('ncloud-share-link');
  const ncloudShareCopy = $('ncloud-share-copy');
  const ncloudSharesModal = $('ncloud-shares-modal');
  const ncloudSharesClose = $('ncloud-shares-close');
  const ncloudSharesList = $('ncloud-shares-list');
  const ncloudFolderModal = $('ncloud-folder-modal');
  const ncloudFolderClose = $('ncloud-folder-close');
  const ncloudFolderName = $('ncloud-folder-name');
  const ncloudFolderCancel = $('ncloud-folder-cancel');
  const ncloudFolderConfirm = $('ncloud-folder-confirm');

  let ncloudCurrentPath = '';
  let ncloudSpaceVisible = false;

  function isNCloudView() {
    return !ncloudView.classList.contains('hidden');
  }

  function showNCloud() {
    hide(emailSection);
    hide(inboxSection);
    hide(viewer);
    show(ncloudView);
    show(headerNav);
    navNcloud.classList.add('active');
    navTmail.classList.remove('active');
    ncloudCurrentPath = '';
    ncloudRenderBreadcrumb();
    ncloudListFiles();
  }

  function hideNCloud() {
    hide(ncloudView);
    navTmail.classList.add('active');
    navNcloud.classList.remove('active');
    show(emailSection);
    if (currentAddress) show(inboxSection);
  }

  function ncloudRenderBreadcrumb() {
    const parts = ncloudCurrentPath.split('/').filter(Boolean);
    let html = '<button class="breadcrumb-item' + (parts.length === 0 ? ' active' : '') + '" data-path="">Archivos</button>';
    let accumulated = '';
    parts.forEach((part, i) => {
      accumulated += (i > 0 ? '/' : '') + part;
      const isLast = i === parts.length - 1;
      html += '<span class="breadcrumb-sep">/</span>';
      html += '<button class="breadcrumb-item' + (isLast ? ' active' : '') + '" data-path="' + esc(accumulated) + '">' + esc(part) + '</button>';
    });
    ncloudBreadcrumb.innerHTML = html;
    ncloudBreadcrumb.querySelectorAll('.breadcrumb-item').forEach(btn => {
      btn.addEventListener('click', () => {
        ncloudCurrentPath = btn.dataset.path;
        ncloudRenderBreadcrumb();
        ncloudListFiles();
      });
    });
  }

  async function ncloudListFiles() {
    if (!currentAddress || !currentSecret) return;
    try {
      const res = await fetch(`${API}/ncloud/files?path=${encodeURIComponent(ncloudCurrentPath)}`, {
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      const data = await res.json();
      if (!data.folders && !data.files) {
        ncloudEmpty.classList.remove('hidden');
        ncloudFiles.innerHTML = '';
        ncloudFiles.appendChild(ncloudEmpty);
        return;
      }
      const folders = data.folders || [];
      const files = data.files || [];
      if (folders.length === 0 && files.length === 0) {
        ncloudEmpty.classList.remove('hidden');
        ncloudFiles.innerHTML = '';
        ncloudFiles.appendChild(ncloudEmpty);
        return;
      }
      let html = '';
      folders.forEach((f, i) => {
        html += `<div class="ncloud-file-item" style="animation-delay:${i * 0.03}s" data-type="folder" data-name="${esc(f.name)}">
          <div class="ncloud-file-icon folder">${getFileIconSvg('folder')}</div>
          <div class="ncloud-file-info">
            <div class="ncloud-file-name">${esc(f.name)}</div>
            <div class="ncloud-file-meta">Carpeta</div>
          </div>
          <div class="ncloud-file-actions">
            <button class="ncloud-file-action delete" title="Eliminar" data-action="delete-folder" data-name="${esc(f.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
      });
      files.forEach((f, i) => {
        const cat = getFileCategory(f.name);
        html += `<div class="ncloud-file-item" style="animation-delay:${(folders.length + i) * 0.03}s" data-type="file" data-key="${esc(f.key)}" data-name="${esc(f.name)}">
          <div class="ncloud-file-icon ${cat}">${getFileIconSvg(cat)}</div>
          <div class="ncloud-file-info">
            <div class="ncloud-file-name">${esc(f.name)}</div>
            <div class="ncloud-file-meta">${formatSize(f.size)}</div>
          </div>
          <div class="ncloud-file-actions">
            <button class="ncloud-file-action share" title="Compartir" data-action="share" data-key="${esc(f.key)}" data-name="${esc(f.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button class="ncloud-file-action" title="Descargar" data-action="download" data-key="${esc(f.key)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="ncloud-file-action delete" title="Eliminar" data-action="delete-file" data-key="${esc(f.key)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
      });
      ncloudFiles.innerHTML = html;
    } catch (e) {
      console.error('NCloud list error:', e);
    }
  }

  async function ncloudUploadFiles(fileList) {
    if (!currentAddress || !currentSecret || fileList.length === 0) return;
    show(ncloudProgress);
    const total = fileList.length;
    let completed = 0;
    let aborted = false;
    for (const file of fileList) {
      if (aborted) break;
      try {
        const key = ncloudCurrentPath ? ncloudCurrentPath + '/' + file.name : file.name;
        const uploadRes = await fetch(`${API}/ncloud/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAddress}:${currentSecret}` },
          body: JSON.stringify({ key, size: file.size })
        });
        const result = await uploadRes.json();
        if (result.error) {
          alert(result.error);
          aborted = true;
          break;
        }
        if (!result.url) continue;
        await fetch(result.url, { method: 'PUT', body: file });
        const confirmRes = await fetch(`${API}/ncloud/confirm-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAddress}:${currentSecret}` },
          body: JSON.stringify({ key: result.key })
        });
        const confirm = await confirmRes.json();
        if (confirm.error) {
          alert(confirm.error);
          aborted = true;
          break;
        }
        completed++;
        const pct = Math.round((completed / total) * 100);
        ncloudProgressFill.style.width = pct + '%';
        ncloudProgressText.textContent = `Subiendo... ${completed}/${total}`;
      } catch (e) {
        console.error('Upload error:', e);
      }
    }
    setTimeout(() => {
      hide(ncloudProgress);
      ncloudProgressFill.style.width = '0%';
      ncloudListFiles();
      ncloudUpdateSpace();
    }, 500);
  }

  async function ncloudDownloadFile(key) {
    if (!currentAddress || !currentSecret) return;
    try {
      const res = await fetch(`${API}/ncloud/download-url?key=${encodeURIComponent(key)}`, {
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      const { url } = await res.json();
      if (url) window.open(url, '_blank');
    } catch (e) {
      console.error('Download error:', e);
    }
  }

  async function ncloudDeleteFile(key) {
    if (!currentAddress || !currentSecret) return;
    if (!confirm('Eliminar este archivo?')) return;
    try {
      await fetch(`${API}/ncloud/file?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      ncloudListFiles();
      ncloudUpdateSpace();
    } catch (e) {
      console.error('Delete error:', e);
    }
  }

  async function ncloudDeleteFolder(name) {
    if (!currentAddress || !currentSecret) return;
    if (!confirm(`Eliminar la carpeta "${name}" y todo su contenido?`)) return;
    const prefix = ncloudCurrentPath ? ncloudCurrentPath + '/' + name + '/' : name + '/';
    try {
      const res = await fetch(`${API}/ncloud/files?path=${encodeURIComponent(prefix)}`, {
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      const data = await res.json();
      const allKeys = (data.files || []).map(f => f.key);
      await fetch(`${API}/ncloud/delete-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAddress}:${currentSecret}` },
        body: JSON.stringify({ keys: allKeys })
      });
      ncloudListFiles();
      ncloudUpdateSpace();
    } catch (e) {
      console.error('Delete folder error:', e);
    }
  }

  async function ncloudCreateFolder(name) {
    if (!currentAddress || !currentSecret || !name.trim()) return;
    try {
      const path = ncloudCurrentPath ? ncloudCurrentPath + '/' + name.trim() : name.trim();
      await fetch(`${API}/ncloud/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAddress}:${currentSecret}` },
        body: JSON.stringify({ path })
      });
      ncloudListFiles();
    } catch (e) {
      console.error('Create folder error:', e);
    }
  }

  async function ncloudShareFile(key, name) {
    if (!currentAddress || !currentSecret) return;
    try {
      const res = await fetch(`${API}/ncloud/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAddress}:${currentSecret}` },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      if (data.url) {
        ncloudShareFilename.textContent = name;
        ncloudShareLink.value = data.url;
        show(ncloudShareModal);
      }
    } catch (e) {
      console.error('Share error:', e);
    }
  }

  async function ncloudListShares() {
    if (!currentAddress || !currentSecret) return;
    try {
      const res = await fetch(`${API}/ncloud/shares`, {
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      const data = await res.json();
      const shares = data.shares || [];
      if (shares.length === 0) {
        ncloudSharesList.innerHTML = '<p class="ncloud-empty">No hay enlaces activos</p>';
        show(ncloudSharesModal);
        return;
      }
      let html = '';
      shares.forEach(s => {
        const fileName = s.file_key.split('/').pop();
        const expiresAt = new Date(s.expires_at).getTime();
        const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 60000));
        html += `<div class="ncloud-share-item">
          <div class="ncloud-share-item-info">
            <div class="ncloud-share-item-name">${esc(fileName)}</div>
            <div class="ncloud-share-item-expiry">Expira en ${remaining} min</div>
          </div>
          <button class="ncloud-share-revoke" data-id="${esc(s.id)}">Revocar</button>
        </div>`;
      });
      ncloudSharesList.innerHTML = html;
      ncloudSharesList.querySelectorAll('.ncloud-share-revoke').forEach(btn => {
        btn.addEventListener('click', () => ncloudRevokeShare(btn.dataset.id));
      });
      show(ncloudSharesModal);
    } catch (e) {
      console.error('List shares error:', e);
    }
  }

  async function ncloudRevokeShare(id) {
    if (!currentAddress || !currentSecret) return;
    try {
      await fetch(`${API}/ncloud/share/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      ncloudListShares();
    } catch (e) {
      console.error('Revoke share error:', e);
    }
  }

  async function ncloudUpdateSpace() {
    if (!currentAddress || !currentSecret) return;
    try {
      const res = await fetch(`${API}/ncloud/space`, {
        headers: { 'Authorization': `Bearer ${currentAddress}:${currentSecret}` }
      });
      const data = await res.json();
      ncloudSpaceUsed.textContent = formatSize(data.used || 0);
      ncloudSpaceCount.textContent = (data.count || 0) + ' archivos';
      const pct = Math.min(100, ((data.used || 0) / (10 * 1024 * 1024 * 1024)) * 100);
      ncloudSpaceFill.style.width = pct + '%';
    } catch (e) {
      console.error('Space error:', e);
    }
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

  // NCloud nav
  navTmail.addEventListener('click', () => {
    hideNCloud();
  });

  navNcloud.addEventListener('click', () => {
    showNCloud();
  });

  // NCloud delegated file events
  ncloudFiles.addEventListener('click', (e) => {
    const item = e.target.closest('.ncloud-file-item');
    if (!item) return;
    const key = item.dataset.key;
    if (e.target.closest('[data-action="download"]')) {
      ncloudDownloadFile(key);
    } else if (e.target.closest('[data-action="share"]')) {
      ncloudShareFile(key, item.dataset.name);
    } else if (e.target.closest('[data-action="delete-file"]')) {
      ncloudDeleteFile(key);
    } else if (e.target.closest('[data-action="delete-folder"]')) {
      ncloudDeleteFolder(item.dataset.name);
    }
  });

  ncloudFiles.addEventListener('dblclick', (e) => {
    const item = e.target.closest('.ncloud-file-item[data-type="folder"]');
    if (!item) return;
    const name = item.dataset.name;
    ncloudCurrentPath = ncloudCurrentPath ? ncloudCurrentPath + '/' + name : name;
    ncloudRenderBreadcrumb();
    ncloudListFiles();
  });

  // NCloud header actions
  ncloudRefreshBtn.addEventListener('click', () => {
    ncloudListFiles();
    ncloudUpdateSpace();
  });

  ncloudSpaceBtn.addEventListener('click', () => {
    ncloudSpaceVisible = !ncloudSpaceVisible;
    if (ncloudSpaceVisible) {
      show(ncloudSpaceBar);
      ncloudUpdateSpace();
    } else {
      hide(ncloudSpaceBar);
    }
  });

  ncloudNewFolderBtn.addEventListener('click', () => {
    ncloudFolderName.value = '';
    show(ncloudFolderModal);
    ncloudFolderName.focus();
  });

  ncloudFolderClose.addEventListener('click', () => hide(ncloudFolderModal));
  ncloudFolderCancel.addEventListener('click', () => hide(ncloudFolderModal));
  ncloudFolderConfirm.addEventListener('click', () => {
    ncloudCreateFolder(ncloudFolderName.value);
    hide(ncloudFolderModal);
  });
  ncloudFolderName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      ncloudCreateFolder(ncloudFolderName.value);
      hide(ncloudFolderModal);
    }
  });
  ncloudFolderModal.addEventListener('click', (e) => {
    if (e.target === ncloudFolderModal) hide(ncloudFolderModal);
  });

  // NCloud upload
  ncloudUploadBtn.addEventListener('click', () => ncloudFileInput.click());
  ncloudFileInput.addEventListener('change', () => {
    if (ncloudFileInput.files.length > 0) {
      ncloudUploadFiles(ncloudFileInput.files);
      ncloudFileInput.value = '';
    }
  });

  ncloudDropzone.addEventListener('click', () => ncloudFileInput.click());
  ncloudDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    ncloudDropzone.classList.add('drag-over');
  });
  ncloudDropzone.addEventListener('dragleave', () => {
    ncloudDropzone.classList.remove('drag-over');
  });
  ncloudDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    ncloudDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      ncloudUploadFiles(e.dataTransfer.files);
    }
  });

  // NCloud share modal
  ncloudShareClose.addEventListener('click', () => hide(ncloudShareModal));
  ncloudShareModal.addEventListener('click', (e) => {
    if (e.target === ncloudShareModal) hide(ncloudShareModal);
  });
  ncloudShareCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(ncloudShareLink.value).then(() => {
      ncloudShareCopy.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        ncloudShareCopy.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 1500);
    });
  });

  // NCloud shares list modal
  ncloudSharesClose.addEventListener('click', () => hide(ncloudSharesModal));
  ncloudSharesModal.addEventListener('click', (e) => {
    if (e.target === ncloudSharesModal) hide(ncloudSharesModal);
  });
})();
