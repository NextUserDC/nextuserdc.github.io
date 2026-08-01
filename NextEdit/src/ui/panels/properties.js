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
      <div class="properties__group properties__group--name">
        <div class="properties__row">
          <label class="properties__label">Nombre</label>
          <input type="text" class="properties__input properties__input--text" id="prop-name" placeholder="Objeto">
        </div>
      </div>
      <div class="properties__group properties__group--position">
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
      </div>
      <div class="properties__group properties__group--transform">
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
        <div class="properties__row">
          <label class="properties__label">Escala X</label>
          <input type="number" class="properties__input properties__input--readonly" id="prop-scale-x" step="0.01" readonly>
          <label class="properties__label">Escala Y</label>
          <input type="number" class="properties__input properties__input--readonly" id="prop-scale-y" step="0.01" readonly>
        </div>
        <div class="properties__row">
          <label class="properties__label">Skew X</label>
          <input type="number" class="properties__input" id="prop-skew-x" step="1">
          <label class="properties__label">Skew Y</label>
          <input type="number" class="properties__input" id="prop-skew-y" step="1">
        </div>
      </div>
      <div class="properties__group properties__group--textbox" id="group-textbox" style="display:none;">
        <div class="properties__row">
          <label class="properties__label">Fuente</label>
          <select class="properties__input properties__input--select" id="prop-font-family">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        <div class="properties__row">
          <label class="properties__label">Tamaño</label>
          <input type="number" class="properties__input" id="prop-font-size" step="1" min="1">
        </div>
        <div class="properties__row">
          <label class="properties__label">Negrita</label>
          <input type="checkbox" class="properties__checkbox" id="prop-font-weight">
          <label class="properties__label">Cursiva</label>
          <input type="checkbox" class="properties__checkbox" id="prop-font-style">
        </div>
        <div class="properties__row">
          <label class="properties__label">Alineación</label>
          <select class="properties__input properties__input--select" id="prop-text-align">
            <option value="left">Izquierda</option>
            <option value="center">Centro</option>
            <option value="right">Derecha</option>
            <option value="justify">Justificado</option>
          </select>
        </div>
      </div>
      <div class="properties__group properties__group--circle" id="group-circle" style="display:none;">
        <div class="properties__row">
          <label class="properties__label">Radio</label>
          <input type="number" class="properties__input" id="prop-radius" step="1" min="1">
        </div>
      </div>
      <div class="properties__group properties__group--rect" id="group-rect" style="display:none;">
        <div class="properties__row">
          <label class="properties__label">Radio X</label>
          <input type="number" class="properties__input" id="prop-rx" step="1" min="0">
          <label class="properties__label">Radio Y</label>
          <input type="number" class="properties__input" id="prop-ry" step="1" min="0">
        </div>
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

  bind('prop-name', 'name', (v) => v || 'Object');
  bind('prop-x', 'left');
  bind('prop-y', 'top');
  bind('prop-w', 'width', (v) => Math.max(1, Number(v)));
  bind('prop-h', 'height', (v) => Math.max(1, Number(v)));
  bind('prop-skew-x', 'skewX');
  bind('prop-skew-y', 'skewY');

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

  bind('prop-font-family', 'fontFamily');
  bind('prop-font-size', 'fontSize', (v) => Math.max(1, Number(v)));
  bind('prop-text-align', 'textAlign');

  const fontWeightCheck = container.querySelector('#prop-font-weight');
  if (fontWeightCheck) {
    fontWeightCheck.addEventListener('change', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set('fontWeight', fontWeightCheck.checked ? 'bold' : 'normal');
      canvas.renderAll();
      bus.emit('canvas:object:modified', { target: active });
    });
  }

  const fontStyleCheck = container.querySelector('#prop-font-style');
  if (fontStyleCheck) {
    fontStyleCheck.addEventListener('change', () => {
      if (isUpdating) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set('fontStyle', fontStyleCheck.checked ? 'italic' : 'normal');
      canvas.renderAll();
      bus.emit('canvas:object:modified', { target: active });
    });
  }

  bind('prop-radius', 'radius', (v) => Math.max(1, Number(v)));
  bind('prop-rx', 'rx', (v) => Math.max(0, Number(v)));
  bind('prop-ry', 'ry', (v) => Math.max(0, Number(v)));
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

  set('prop-name', active.name || '');
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

  set('prop-scale-x', (active.scaleX || 1).toFixed(2));
  set('prop-scale-y', (active.scaleY || 1).toFixed(2));
  set('prop-skew-x', active.skewX || 0);
  set('prop-skew-y', active.skewY || 0);

  const showGroup = (id, show) => {
    const el = container.querySelector(`#${id}`);
    if (el) el.style.display = show ? '' : 'none';
  };

  const isTextbox = active.type === 'textbox' || active.type === 'i-text' || active.type === 'text';
  showGroup('group-textbox', isTextbox);
  if (isTextbox) {
    set('prop-font-family', active.fontFamily || 'Arial');
    set('prop-font-size', active.fontSize || 24);
    const fontWeightCheck = container.querySelector('#prop-font-weight');
    if (fontWeightCheck) fontWeightCheck.checked = active.fontWeight === 'bold';
    const fontStyleCheck = container.querySelector('#prop-font-style');
    if (fontStyleCheck) fontStyleCheck.checked = active.fontStyle === 'italic';
    set('prop-text-align', active.textAlign || 'left');
  }

  const isCircle = active.type === 'circle';
  showGroup('group-circle', isCircle);
  if (isCircle) {
    set('prop-radius', active.radius || 50);
  }

  const isRect = active.type === 'rect';
  showGroup('group-rect', isRect);
  if (isRect) {
    set('prop-rx', active.rx || 0);
    set('prop-ry', active.ry || 0);
  }

  isUpdating = false;
}

function clearFields() {
  if (!container) return;
  const empty = container.querySelector('#properties-empty');
  const form = container.querySelector('#properties-form');
  if (empty) empty.style.display = '';
  if (form) form.style.display = 'none';
}