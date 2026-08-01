import * as fabric from 'fabric';
import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' }
];

export function initBlendingPanel(containerEl) {
  container = containerEl;
  render();
  listen();
}

function listen() {
  bus.on('selection:created', syncFromSelection);
  bus.on('selection:updated', syncFromSelection);
  bus.on('selection:cleared', syncFromSelection);
}

function render() {
  if (!container) return;
  const options = BLEND_MODES.map(m =>
    `<option value="${m.value}">${m.label}</option>`
  ).join('');

  container.innerHTML = `
    <div class="blending-panel">
      <div class="blending-panel__row">
        <span class="blending-panel__label">Modo</span>
        <select class="blending-panel__select" id="blend-mode">
          ${options}
        </select>
      </div>
    </div>
  `;

  container.querySelector('#blend-mode')?.addEventListener('change', (e) => {
    const canvas = editor.canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set('globalCompositeOperation', e.target.value);
      canvas.renderAll();
      bus.emit('canvas:object:modified');
    }
  });
}

function syncFromSelection() {
  if (!container) return;
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  const select = container.querySelector('#blend-mode');
  if (!select) return;

  if (active) {
    const mode = active.globalCompositeOperation || 'source-over';
    select.value = mode;
  } else {
    select.value = 'source-over';
  }
}
