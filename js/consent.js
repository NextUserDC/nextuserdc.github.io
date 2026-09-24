/* nextuser.lat — Consentimiento de cookies y gate de trackers
   Categorías: necesarias (siempre), estadísticas (Cloudflare Web Analytics),
   marketing (Google AdSense). Los marcadores inértes <script type="text/plain"
   data-nu-track="..."> solo se activan tras consentimiento explícito.
   Registro de consentimiento en localStorage 'nu-consent' (Ley 21.719 / AdSense EEA). */
(function () {
  'use strict';

  var KEY = 'nu-consent';
  var isEN = location.pathname.indexOf('/en/') === 0;

  var T = {
    es: {
      title: 'Cookies y analítica',
      body: 'Este sitio usa cookies y tecnologías similares para analítica (Cloudflare Web Analytics) y para publicidad personalizada (Google AdSense). Las cookies necesarias para que el sitio funcione siempre están activas. Puedes aceptar todas, rechazar las no esenciales o personalizar tus preferencias.',
      accept: 'Aceptar todo',
      reject: 'Rechazar no esenciales',
      customize: 'Personalizar',
      save: 'Guardar preferencias',
      cat: 'Categorías',
      necessary: 'Necesarias',
      necessaryHint: 'Siempre activas (preferencias y sesión)',
      stats: 'Estadísticas',
      statsHint: 'Cloudflare Web Analytics (visitas anónimas)',
      marketing: 'Publicidad',
      marketingHint: 'Google AdSense (anuncios personalizados)',
      links: 'Más información: ',
      cookies: 'Política de cookies',
      privacy: 'Privacidad',
      manage: 'Gestionar cookies'
    },
    en: {
      title: 'Cookies and analytics',
      body: 'This site uses cookies and similar technologies for analytics (Cloudflare Web Analytics) and for personalized advertising (Google AdSense). Cookies needed for the site to work are always active. You can accept all, reject non-essential ones, or customize your preferences.',
      accept: 'Accept all',
      reject: 'Reject non-essential',
      customize: 'Customize',
      save: 'Save preferences',
      cat: 'Categories',
      necessary: 'Necessary',
      necessaryHint: 'Always active (preferences and session)',
      stats: 'Statistics',
      statsHint: 'Cloudflare Web Analytics (anonymous visits)',
      marketing: 'Advertising',
      marketingHint: 'Google AdSense (personalized ads)',
      links: 'More information: ',
      cookies: 'Cookie policy',
      privacy: 'Privacy',
      manage: 'Manage cookies'
    }
  };

  var t = T[isEN ? 'en' : 'es'];
  var PRIV = isEN ? '/en/privacidad.html' : '/privacidad.html';
  var COOK = isEN ? '/en/cookies.html' : '/cookies.html';

  function read() {
    try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }

  function write(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
  }

  /* ---- Gate: activar marcadores inértes según consentimiento ---- */
  function activate(rec) {
    if (!rec) return;

    if (rec.marketing) {
      var ads = document.querySelectorAll('script[type="text/plain"][data-nu-track="ads"][data-src]');
      for (var i = 0; i < ads.length; i++) {
        var a = ads[i];
        if (a.getAttribute('data-nu-loaded')) continue;
        a.setAttribute('data-nu-loaded', '1');
        var s = document.createElement('script');
        s.async = true;
        s.src = a.getAttribute('data-src');
        if (a.getAttribute('crossorigin')) s.crossOrigin = 'anonymous';
        a.parentNode.insertBefore(s, a.nextSibling);
      }
    }

    if (rec.statistics) {
      var b = document.querySelectorAll('script[type="text/plain"][data-nu-track="beacon"][data-src]');
      for (var j = 0; j < b.length; j++) {
        var m = b[j];
        if (m.getAttribute('data-nu-loaded')) continue;
        m.setAttribute('data-nu-loaded', '1');
        var sb = document.createElement('script');
        sb.async = true;
        sb.src = m.getAttribute('data-src');
        var tok = m.getAttribute('data-cf-beacon');
        if (tok) sb.setAttribute('data-cf-beacon', tok);
        (document.body || document.head).appendChild(sb);
      }
    }
  }

  /* ---- Banner ---- */
  var root = null;
  var customView = false;

  function current() {
    return read() || { necessary: true, statistics: false, marketing: false };
  }

  function css() {
    return [
      'position:fixed', 'left:16px', 'right:74px', 'bottom:16px', 'max-width:560px',
      'z-index:100001', 'padding:16px 18px', 'border-radius:14px',
      'background:rgba(18,18,28,.94)', 'color:#e2e8f0',
      'border:1px solid rgba(255,255,255,.16)',
      'backdrop-filter:blur(10px)', '-webkit-backdrop-filter:blur(10px)',
      'box-shadow:0 8px 32px rgba(0,0,0,.45)',
      'font:400 14px/1.5 system-ui,-apple-system,sans-serif'
    ].join(';');
  }

  function btn(primary) {
    var b = 'padding:9px 16px;border-radius:9px;font:600 13px/1 system-ui,sans-serif;cursor:pointer;border:1px solid rgba(255,255,255,.2);';
    return primary
      ? b + 'background:#7c3aed;color:#fff;border-color:#7c3aed;'
      : b + 'background:rgba(255,255,255,.08);color:#e2e8f0;';
  }

  function build() {
    if (root) { render(); return; }
    root = document.createElement('div');
    root.id = 'nu-consent-banner';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', t.title);
    root.style.cssText = css();
    mount();
    render();
  }

  function mount() {
    if (document.body) document.body.appendChild(root);
    else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(root); });
  }

  function render() {
    var c = current();
    var html = '';
    html += '<strong style="display:block;margin-bottom:6px;font-size:15px;">' + t.title + '</strong>';

    if (!customView) {
      html += '<p style="margin:0 0 10px;">' + t.body + '</p>';
      html += '<p style="margin:0 0 12px;font-size:12.5px;opacity:.85;">' + t.links +
        '<a href="' + COOK + '" style="color:#a78bfa;">' + t.cookies + '</a> · ' +
        '<a href="' + PRIV + '" style="color:#a78bfa;">' + t.privacy + '</a></p>';
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button id="nu-accept" style="' + btn(true) + '">' + t.accept + '</button>' +
        '<button id="nu-reject" style="' + btn(false) + '">' + t.reject + '</button>' +
        '<button id="nu-custom" style="' + btn(false) + '">' + t.customize + '</button>' +
        '</div>';
    } else {
      html += '<div style="margin:8px 0 12px;">';
      html += '<label style="display:flex;gap:8px;align-items:center;padding:6px 0;opacity:.75;">' +
        '<input type="checkbox" checked disabled> <span><b>' + t.necessary + '</b> — ' + t.necessaryHint + '</span></label>';
      html += '<label style="display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer;">' +
        '<input type="checkbox" id="nu-st"' + (c.statistics ? ' checked' : '') + '> <span><b>' + t.stats + '</b> — ' + t.statsHint + '</span></label>';
      html += '<label style="display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer;">' +
        '<input type="checkbox" id="nu-mk"' + (c.marketing ? ' checked' : '') + '> <span><b>' + t.marketing + '</b> — ' + t.marketingHint + '</span></label>';
      html += '</div>';
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button id="nu-save" style="' + btn(true) + '">' + t.save + '</button>' +
        '<button id="nu-back" style="' + btn(false) + '">←</button>' +
        '</div>';
    }

    root.innerHTML = html;
    bind();
  }

  function bind() {
    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }

    on('nu-accept', function () { commit(true, true); });
    on('nu-reject', function () { commit(false, false); });
    on('nu-custom', function () { customView = true; render(); });
    on('nu-back', function () { customView = false; render(); });
    on('nu-save', function () {
      var st = document.getElementById('nu-st');
      var mk = document.getElementById('nu-mk');
      commit(st && st.checked, mk && mk.checked);
    });
  }

  function commit(stats, mkt) {
    var prev = read();
    var rec = {
      v: 1,
      date: new Date().toISOString(),
      first: prev ? prev.first : new Date().toISOString(),
      version: '2026-09-24',
      necessary: true,
      statistics: !!stats,
      marketing: !!mkt
    };
    write(rec);
    activate(rec);
    hide();
  }

  function hide() { if (root && root.parentNode) root.parentNode.removeChild(root); root = null; customView = false; }

  function open() { build(); }

  /* Enlace "Gestionar cookies" del footer */
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute('data-nu-consent-manage') !== null) {
        e.preventDefault();
        customView = false;
        open();
        return;
      }
      el = el.parentNode;
    }
  });

  /* ---- Init ---- */
  function init() {
    var rec = read();
    if (rec) activate(rec);
    else build();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
