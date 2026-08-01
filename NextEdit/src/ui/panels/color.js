import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;
let currentColor = '#000000';
let colorMode = 'fill';
const unsubscribers = [];

const SWATCHES = [
  '#000000', '#ffffff', '#ff0000', '#ff8c00', '#ffd700',
  '#00c853', '#00bcd4', '#2979ff', '#7c4dff', '#ff4081',
  '#8d6e63', '#9e9e9e'
];

export function initColorPanel(containerEl) {
  container = containerEl;
  render();
  listen();
}

function listen() {
  const on = (ev, fn) => { unsubscribers.push(bus.on(ev, fn)); };
  on('selection:created', syncFromSelection);
  on('selection:updated', syncFromSelection);
  on('selection:cleared', () => {
    currentColor = '#000000';
    updateInputs(currentColor);
  });
  on('color:change', ({ color }) => {
    currentColor = color;
    updateInputs(color);
  });
}

function render() {
  if (!container) return;
  container.innerHTML = `
    <div class="color-panel__modes">
      <button class="color-panel__mode-btn color-panel__mode-btn--active" data-mode="fill">Relleno</button>
      <button class="color-panel__mode-btn" data-mode="stroke">Trazo</button>
    </div>
    <div class="color-panel__current">
      <div class="color-panel__preview">
        <div class="color-panel__preview-fg" id="color-fg" style="background:${currentColor}"></div>
      </div>
      <input type="text" class="color-panel__hex" id="color-hex" value="${currentColor}" maxlength="7" spellcheck="false">
      <input type="color" id="color-picker" value="${currentColor}" style="width:32px;height:28px;border:none;padding:0;cursor:pointer;">
    </div>
    <div class="color-panel__swatches" id="color-swatches"></div>
  `;

  const swatchContainer = container.querySelector('#color-swatches');
  SWATCHES.forEach((hex) => {
    const swatch = document.createElement('button');
    swatch.className = 'color-panel__swatch';
    swatch.style.background = hex;
    if (hex === '#ffffff') {
      swatch.classList.add('color-panel__swatch--light');
    }
    swatch.title = hex;
    swatch.addEventListener('click', () => applyColor(hex));
    swatchContainer.appendChild(swatch);
  });

  container.querySelectorAll('.color-panel__mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      colorMode = btn.dataset.mode;
      container.querySelectorAll('.color-panel__mode-btn').forEach((b) =>
        b.classList.toggle('color-panel__mode-btn--active', b === btn)
      );
      syncFromSelection();
    });
  });

  container.querySelector('#color-picker')?.addEventListener('input', (e) => {
    applyColor(e.target.value);
  });

  container.querySelector('#color-hex')?.addEventListener('change', (e) => {
    const hex = e.target.value;
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      applyColor(hex);
    } else {
      e.target.value = currentColor;
    }
  });
}

function applyColor(hex) {
  currentColor = hex;
  updateInputs(hex);

  const canvas = editor.canvas;
  if (!canvas) return;

  const active = canvas.getActiveObject();
  if (active) {
    if (colorMode === 'fill') {
      active.set('fill', hex);
    } else {
      active.set('stroke', hex);
      if (!active.strokeWidth) active.set('strokeWidth', 2);
    }
    canvas.renderAll();
  }

  bus.emit('color:change', { type: colorMode, color: hex });
}

function updateInputs(hex) {
  if (!container) return;
  const fg = container.querySelector('#color-fg');
  const hexInput = container.querySelector('#color-hex');
  const picker = container.querySelector('#color-picker');
  if (fg) fg.style.background = hex;
  if (hexInput) hexInput.value = hex;
  if (picker) picker.value = hex;
}

function syncFromSelection() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active) return;

  const color = colorMode === 'fill' ? (active.fill || '#000000') : (active.stroke || '#000000');
  if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) {
    currentColor = color;
    updateInputs(color);
  }
}
