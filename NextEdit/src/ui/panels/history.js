import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;
let states = [];
let currentPosition = -1;
let unsubscribers = [];

export function initHistoryPanel(containerEl) {
  container = containerEl;
  render();
  listen();
}

function listen() {
  const on = (ev, fn) => { unsubscribers.push(bus.on(ev, fn)); };
  on('history:change', onHistoryChange);
  on('editor:undo', refresh);
  on('editor:redo', refresh);
}

function render() {
  if (!container) return;
  container.innerHTML = `
    <div class="history__list" id="history-list"></div>
  `;
  refresh();
}

function onHistoryChange({ position, total }) {
  currentPosition = position;
  states = editor.history?._states || [];
  refresh();
}

function refresh() {
  if (!container) return;
  const list = container.querySelector('#history-list');
  if (!list) return;

  const history = editor.history;
  if (!history || history.total === 0) {
    list.innerHTML = '<div class="history__empty">Sin historial</div>';
    return;
  }

  states = history._states;
  currentPosition = history.position;

  list.innerHTML = '';

  states.forEach((state, idx) => {
    const item = document.createElement('div');
    item.className = 'history__item';
    if (idx === currentPosition) {
      item.classList.add('history__item--current');
    }
    if (idx > currentPosition) {
      item.classList.add('history__item--future');
    }

    const label = document.createElement('span');
    label.className = 'history__label';
    label.textContent = getStepLabel(state, idx);

    const dot = document.createElement('span');
    dot.className = 'history__dot';
    if (idx === currentPosition) {
      dot.style.background = 'var(--accent, #0078d4)';
    } else if (idx < currentPosition) {
      dot.style.background = 'var(--text-muted, #666)';
    } else {
      dot.style.background = 'var(--border, #333)';
    }

    item.appendChild(dot);
    item.appendChild(label);

    item.addEventListener('click', () => jumpToState(idx));

    list.appendChild(item);
  });
}

function getStepLabel(state, idx) {
  if (idx === 0) return 'Estado inicial';
  const objects = state.objects || [];
  const count = objects.length;
  if (count === 0) return `Paso ${idx} — Vacío`;
  if (count === 1) {
    const type = objects[0].type || 'objeto';
    return `Paso ${idx} — ${type}`;
  }
  return `Paso ${idx} — ${count} objetos`;
}

function jumpToState(targetIndex) {
  const history = editor.history;
  if (!history) return;

  const diff = targetIndex - history.position;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) history.redo();
  } else if (diff < 0) {
    for (let i = 0; i < Math.abs(diff); i++) history.undo();
  }

  const state = history._states[history.position];
  if (state) {
    editor.canvas.loadFromJSON(state).then(() => {
      editor.canvas.renderAll();
      bus.emit('editor:undo');
    });
  }
}
