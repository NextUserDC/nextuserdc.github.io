import { bus } from '../core/events.js';

let container = null;

let toastBound = false;

export function initToast() {
  if (!container || !container.parentElement) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }

  if (!toastBound) {
    toastBound = true;
    bus.on('toast:show', ({ message, type = 'info', duration = 3000 }) => {
      showToast(message, type, duration);
    });
  }
}

function showToast(message, type, duration) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.style.cssText = `
    padding: 10px 16px; border-radius: 6px; color: #fff; font-size: 13px;
    pointer-events: auto; cursor: pointer; opacity: 0; transform: translateX(20px);
    transition: all 0.25s ease; max-width: 320px; word-wrap: break-word;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  toast.textContent = message;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  toast.addEventListener('click', () => removeToast(toast));
  
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(20px)';
  setTimeout(() => toast.remove(), 250);
}


if (!window._nexteditErrorBound) {
  window._nexteditErrorBound = true;
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver')) return;
    bus.emit('toast:show', { message: e.message, type: 'error' });
  });
}
