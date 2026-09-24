/* nextuser.lat — i18n: auto-redirect ES/EN + toggle
   '/' = español, '/en/' = inglés. Solo aplica a páginas traducidas. */
(function () {
  'use strict';

  var KEY = 'nu-lang';

  // Rutas que tienen versión EN (relativas al dominio, sin index.html)
  var TRANSLATED = [
    '/',
    '/TMail/',
    '/MCAccounts/',
    '/GameFinder/',
    '/Os/',
    '/Mesa58/',
    '/SimulaVIP/',
    '/Photobooth/',
    '/Photobooth/inicio.html',
    '/Photobooth/servicios.html',
    '/Photobooth/finanzas.html',
    '/Photobooth/nosotros.html',
    '/Photobooth/contacto.html',
    '/Games/',
    '/Games/ludo/',
    '/Games/typing/',
    '/privacidad.html',
    '/cookies.html',
    '/terminos.html'
  ];

  var path = location.pathname;
  if (path.slice(-11) === '/index.html') path = path.slice(0, -11) || '/';
  else if (path.slice(-5) === '.html') path = path;

  var isEN = path === '/en' || path.indexOf('/en/') === 0;

  function enPath(p) {
    if (p === '/' || p === '/en') return '/en/';
    if (p.indexOf('/en/') === 0) return p;
    return '/en' + p;
  }
  function esPath(p) {
    if (p === '/en' || p === '/en/') return '/';
    if (p.indexOf('/en/') === 0) return p.slice(3) || '/';
    return p;
  }

  // Ruta "limpia" para comparar con la lista de traducidas
  function cleanPath(p) {
    if (p.slice(-11) === '/index.html') p = p.slice(0, -11) || '/';
    if (p === '/en' || p === '/en/') p = '/';
    else if (p.indexOf('/en/') === 0) p = p.slice(3) || '/';
    return p;
  }

  var available = TRANSLATED.indexOf(cleanPath(path)) !== -1;

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  // --- Auto-redirect (solo ES -> EN, solo si el navegador es EN y hay versión) ---
  if (available && !isEN && stored !== 'es') {
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('en') === 0 || stored === 'en') {
      location.replace(enPath(path) + location.search + location.hash);
      return;
    }
  }
  // Si eligió ES explícitamente, volver de /en/ a /
  if (available && isEN && stored === 'es') {
    location.replace(esPath(path) + location.search + location.hash);
    return;
  }

  // --- Toggle ES/EN ---
  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }

  function buildToggle() {
    if (!available) return;
    if (document.getElementById('nu-lang-toggle')) return;

    var btn = document.createElement('a');
    btn.id = 'nu-lang-toggle';
    btn.href = isEN ? esPath(path) : enPath(path);
    btn.textContent = isEN ? 'ES' : 'EN';
    btn.setAttribute('aria-label', isEN ? 'Cambiar a español' : 'Switch to English');
    btn.setAttribute('title', isEN ? 'Español' : 'English');
    btn.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:99999',
      'width:44px',
      'height:44px',
      'border-radius:50%',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font:600 13px/1 system-ui,sans-serif',
      'letter-spacing:.5px',
      'text-decoration:none',
      'color:#f8fafc',
      'background:rgba(22,22,35,.85)',
      'border:1px solid rgba(255,255,255,.18)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'box-shadow:0 4px 18px rgba(0,0,0,.35)',
      'transition:transform .15s ease, background .15s ease'
    ].join(';');

    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'scale(1.08)';
      btn.style.background = 'rgba(40,40,64,.95)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
      btn.style.background = 'rgba(22,22,35,.85)';
    });
    btn.addEventListener('click', function () {
      setLang(isEN ? 'es' : 'en');
    });

    function mount() {
      if (document.body) document.body.appendChild(btn);
      else document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(btn);
      });
    }
    mount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToggle);
  } else {
    buildToggle();
  }
})();
