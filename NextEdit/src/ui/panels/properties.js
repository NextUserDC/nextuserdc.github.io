import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;
let unsubscribers = [];
let isUpdating = false;

export function initPropertiesPanel(containerEl) {
  container = containerEl;
  render();
  listen();
}

function listen() {
  const on = (ev, fn) => { unsubscribers.push(bus.on(ev, fn)); };
  on('selection:created', populateFromSelection);
  on('selection:updated', populateFromSelection);
  on('selection:cleared', clearFields);
  on('editor:undo', populateFromSelection);
  on('editor:redo', populateFromSelection);
}

function render() {
  if (!container) return;
  container.innerHTML = `
    <div class="properties__empty" id="properties-empty">Sin selección</div>
    <div class="properties__form" id="properties-form" style="display:none;">
      <div class="properties__row">
        <label class="properties__label">X</label>
        <input type="number" class="properties__input" id="prop-x" step="1">
        <label class="properties__label">Y</label>
        <input type="number" class="properties__input" id="prop-y" step="1">
      </div>
      <div class="properties__row">
        <label class="properties__label">Ancho</label>
        <input type="number" class="properties__input" id="prop-w" step="1" min="1">
        <label class="properties__label">Alto</label>
        <input type="number" class="properties__input" id="prop-h" step="1" min="1">
      </div>
      <div class="properties__row">
        <label class="properties__label">Rotación</label>
        <input type="number" class="properties__input" id="prop-rotation" step="1" min="0" max="360">
      </div>
      <div class="properties__row">
        <label class="properties__label">Rot</label>
        <input type="range" class="properties__slider" id="prop-rotation-slider" min="0" max="360" step="1">
      </div>
      <div class="properties__row">
        <label class="properties__label">Opacidad</label>
        <input type="number" class="properties__input" id="prop-opacity" min="0" max="100" step="1">
      </div>
      <div class="properties__row">
        <label class="properties__label">Op</label>
        <input type="range" class="properties__slider" id="prop-opacity-slider" min="0" max="100" step="1">
      </div>
    </div>
  `;

  bindInputs();
}

function bindInputs() {
  const canvas = editor.canvas;
  if (!container || !canvas) return;

  const bind = (id, prop, transform) => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      const value = transform ? transform(el.value) : Number(el.value);
      active.set(prop, value);
      canvas.renderAll();
      bus.emit('canvas:object:modified', { target: active });
    });
  };

  bind('prop-x', 'left');
  bind('prop-y', 'top');
  bind('prop-w', 'width', (v) => Math.max(1, Number(v)));
  bind('prop-h', 'height', (v) => Math.max(1, Number(v)));

  const rotInput = container.querySelector('#prop-rotation');
  const rotSlider = container.querySelector('#prop-rotation-slider');
  if (rotInput) {
    rotInput.addEventListener('change', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      const deg = Number(rotInput.value) % 360;
      active.set('angle', deg);
      canvas.renderAll();
      bus.emit('canvas:object:modified', { target: active });
    });
  }
  if (rotSlider) {
    rotSlider.addEventListener('input', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      const deg = Number(rotSlider.value);
      active.set('angle', deg);
      if (rotInput) rotInput.value = deg;
      canvas.renderAll();
    });
    rotSlider.addEventListener('change', () => {
      const active = canvas.getActiveObject();
      if (active) bus.emit('canvas:object:modified', { target: active });
    });
  }

  const opInput = container.querySelector('#prop-opacity');
  const opSlider = container.querySelector('#prop-opacity-slider');
  if (opInput) {
    opInput.addEventListener('change', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set('opacity', Math.min(100, Math.max(0, Number(opInput.value))) / 100);
      canvas.renderAll();
      bus.emit('canvas:object:modified', { target: active });
    });
  }
  if (opSlider) {
    opSlider.addEventListener('input', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set('opacity', Number(opSlider.value) / 100);
      if (opInput) opInput.value = opSlider.value;
      canvas.renderAll();
    });
    opSlider.addEventListener('change', () => {
      const active = canvas.getActiveObject();
      if (active) bus.emit('canvas:object:modified', { target: active });
    });
  }
}

function populateFromSelection() {
  if (!container) return;
  const canvas = editor.canvas;
  const active = canvas?.getActiveObject();
  const empty = container.querySelector('#properties-empty');
  const form = container.querySelector('#properties-form');

  if (!active) {
    clearFields();
    return;
  }

  if (empty) empty.style.display = 'none';
  if (form) form.style.display = '';

  isUpdating = true;

  const set = (id, value) => {
    const el = container.querySelector(`#${id}`);
    if (el) el.value = value;
  };

  set('prop-x', Math.round(active.left || 0));
  set('prop-y', Math.round(active.top || 0));
  set('prop-w', Math.round((active.width || 0) * (active.scaleX || 1)));
  set('prop-h', Math.round((active.height || 0) * (active.scaleY || 1)));

  const angle = Math.round(active.angle || 0);
  set('prop-rotation', angle);
  const rotSlider = container.querySelector('#prop-rotation-slider');
  if (rotSlider) rotSlider.value = angle;

  const opacity = Math.round((active.opacity ?? 1) * 100);
  set('prop-opacity', opacity);
  const opSlider = container.querySelector('#prop-opacity-slider');
  if (opSlider) opSlider.value = opacity;

  isUpdating = false;
}

function clearFields() {
  if (!container) return;
  const empty = container.querySelector('#properties-empty');
  const form = container.querySelector('#properties-form');
  if (empty) empty.style.display = '';
  if (form) form.style.display = 'none';
}
