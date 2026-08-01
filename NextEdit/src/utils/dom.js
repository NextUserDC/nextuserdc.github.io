export function $(id) {
  return document.getElementById(id);
}

export function createElement(tag, className = '', attrs = {}) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'textContent') {
      el.textContent = value;
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  return el;
}

export function show(el) {
  if (el) el.style.display = '';
}

export function hide(el) {
  if (el) el.style.display = 'none';
}

export function toggle(el) {
  if (!el) return;
  el.style.display = el.style.display === 'none' ? '' : 'none';
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

export function formatDimensions(w, h) {
  return `${w} × ${h}`;
}
