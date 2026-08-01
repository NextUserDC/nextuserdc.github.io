import { bus } from '../core/events.js';
import { editor } from '../core/editor.js';

const THEME = {
  bg: '#1e1e2e',
  border: '#313244',
  text: '#cdd6f4',
  muted: '#a6adc8',
  hover: '#45475a',
  accent: '#89b4fa',
};

let menuEl = null;

function hasActiveObject() {
  return editor.canvas && editor.canvas.getActiveObject();
}

function buildMenu() {
  const items = [
    { label: 'Cortar', shortcut: 'Ctrl+X', action: 'edit:cut' },
    { label: 'Copiar', shortcut: 'Ctrl+C', action: 'edit:copy' },
    { label: 'Pegar', shortcut: 'Ctrl+V', action: 'edit:paste' },
    { separator: true },
    { label: 'Eliminar', shortcut: 'Del', action: 'edit:delete' },
    { separator: true },
    { label: 'Traer al frente', action: 'layer:bring-front' },
    { label: 'Enviar atrás', action: 'layer:send-back' },
    { label: 'Duplicar', action: 'layer:duplicate' },
  ];

  const noSelection = !hasActiveObject();
  const el = document.createElement('div');
  el.className = 'ctx-menu';
  el.style.cssText = `
    position: fixed;
    min-width: 200px;
    background: ${THEME.bg};
    border: 1px solid ${THEME.border};
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    padding: 4px 0;
    z-index: 2000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    animation: ctxFadeIn 0.1s ease;
  `;

  for (const item of items) {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'ctx-menu__sep';
      sep.style.cssText = `
        height: 1px;
        background: ${THEME.border};
        margin: 4px 0;
      `;
      el.appendChild(sep);
      continue;
    }

    const btn = document.createElement('div');
    btn.className = 'ctx-menu__item';

    const isDisabled = noSelection;
    if (isDisabled) {
      btn.classList.add('ctx-menu__item--disabled');
    }

    btn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 14px;
      cursor: ${isDisabled ? 'default' : 'pointer'};
      color: ${isDisabled ? THEME.muted : THEME.text};
      transition: background 0.12s ease;
      user-select: none;
    `;

    if (!isDisabled) {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = THEME.hover;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        bus.emit('menu:action', item.action);
        closeMenu();
      });
    }

    const label = document.createElement('span');
    label.textContent = item.label;
    btn.appendChild(label);

    if (item.shortcut) {
      const sc = document.createElement('span');
      sc.className = 'ctx-menu__shortcut';
      sc.textContent = item.shortcut;
      sc.style.cssText = `
        color: ${THEME.muted};
        font-size: 11px;
        margin-left: 24px;
      `;
      btn.appendChild(sc);
    }

    el.appendChild(btn);
  }

  return el;
}

function showMenu(x, y) {
  closeMenu();
  menuEl = buildMenu();

  document.body.appendChild(menuEl);

  const rect = menuEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let posX = x;
  let posY = y;

  if (x + rect.width > vw) {
    posX = vw - rect.width - 4;
  }
  if (y + rect.height > vh) {
    posY = vh - rect.height - 4;
  }

  menuEl.style.left = posX + 'px';
  menuEl.style.top = posY + 'px';
}

function closeMenu() {
  if (menuEl) {
    menuEl.remove();
    menuEl = null;
  }
}

function onDocumentClick() {
  closeMenu();
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    closeMenu();
  }
}

function onContextMenu(e) {
  const upperCanvas = document.querySelector('.upper-canvas');
  if (!upperCanvas) return;
  if (e.target !== upperCanvas) return;

  e.preventDefault();
  e.stopPropagation();
  showMenu(e.clientX, e.clientY);
}

export function initContextMenu() {
  document.addEventListener('contextmenu', onContextMenu, true);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
}
