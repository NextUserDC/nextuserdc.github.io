import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;
let currentColor = '#000000';
let currentAlpha = 1;
let colorMode = 'fill';
let activeTab = 'picker';
const unsubscribers = [];
const recentColors = [];
const MAX_RECENT = 10;

const SWATCHES = [
  '#000000', '#ffffff', '#ff0000', '#ff8c00', '#ffd700',
  '#00c853', '#00bcd4', '#2979ff', '#7c4dff', '#ff4081',
  '#8d6e63', '#9e9e9e'
];

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function addRecentColor(hex) {
  const index = recentColors.indexOf(hex);
  if (index !== -1) recentColors.splice(index, 1);
  recentColors.unshift(hex);
  if (recentColors.length > MAX_RECENT) recentColors.pop();
  renderRecentColors();
}

function renderRecentColors() {
  if (!container) return;
  const containerEl = container.querySelector('#color-recent');
  if (!containerEl) return;
  containerEl.innerHTML = '';
  recentColors.forEach(hex => {
    const swatch = document.createElement('button');
    swatch.className = 'color-panel__swatch';
    swatch.style.background = hex;
    if (hex === '#ffffff') swatch.classList.add('color-panel__swatch--light');
    swatch.title = hex;
    swatch.addEventListener('click', () => applyColor(hex));
    containerEl.appendChild(swatch);
  });
}

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
    currentAlpha = 1;
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
    <div class="color-panel__tabs">
      <button class="color-panel__tab color-panel__tab--active" data-tab="picker">Picker</button>
      <button class="color-panel__tab" data-tab="sliders">Sliders</button>
      <button class="color-panel__tab" data-tab="swatches">Swatches</button>
    </div>
    <div class="color-panel__tab-content" id="tab-picker">
      <div class="color-panel__current">
        <div class="color-panel__preview">
          <div class="color-panel__preview-fg" id="color-fg" style="background:${currentColor}"></div>
        </div>
        <input type="text" class="color-panel__hex" id="color-hex" value="${currentColor}" maxlength="7" spellcheck="false">
        <input type="color" id="color-picker" value="${currentColor}" style="width:32px;height:28px;border:none;padding:0;cursor:pointer;">
      </div>
      <div class="color-panel__alpha">
        <label class="color-panel__slider-label">Alpha</label>
        <input type="range" class="color-panel__slider" id="color-alpha" min="0" max="100" value="${Math.round(currentAlpha * 100)}">
        <span class="color-panel__slider-value" id="color-alpha-value">${Math.round(currentAlpha * 100)}%</span>
      </div>
    </div>
    <div class="color-panel__tab-content" id="tab-sliders" style="display:none;">
      <div class="color-panel__slider-group">
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">R</label>
          <input type="range" class="color-panel__slider" id="slider-r" min="0" max="255" value="0">
          <input type="number" class="color-panel__slider-input" id="input-r" min="0" max="255" value="0">
        </div>
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">G</label>
          <input type="range" class="color-panel__slider" id="slider-g" min="0" max="255" value="0">
          <input type="number" class="color-panel__slider-input" id="input-g" min="0" max="255" value="0">
        </div>
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">B</label>
          <input type="range" class="color-panel__slider" id="slider-b" min="0" max="255" value="0">
          <input type="number" class="color-panel__slider-input" id="input-b" min="0" max="255" value="0">
        </div>
      </div>
      <div class="color-panel__slider-group">
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">H</label>
          <input type="range" class="color-panel__slider" id="slider-h" min="0" max="360" value="0">
          <input type="number" class="color-panel__slider-input" id="input-h" min="0" max="360" value="0">
        </div>
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">S</label>
          <input type="range" class="color-panel__slider" id="slider-s" min="0" max="100" value="0">
          <input type="number" class="color-panel__slider-input" id="input-s" min="0" max="100" value="0">
        </div>
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">L</label>
          <input type="range" class="color-panel__slider" id="slider-l" min="0" max="100" value="0">
          <input type="number" class="color-panel__slider-input" id="input-l" min="0" max="100" value="0">
        </div>
      </div>
      <div class="color-panel__slider-group">
        <div class="color-panel__slider-row">
          <label class="color-panel__slider-label">Alpha</label>
          <input type="range" class="color-panel__slider" id="slider-alpha" min="0" max="100" value="${Math.round(currentAlpha * 100)}">
          <input type="number" class="color-panel__slider-input" id="input-alpha" min="0" max="100" value="${Math.round(currentAlpha * 100)}">
        </div>
      </div>
    </div>
    <div class="color-panel__tab-content" id="tab-swatches" style="display:none;">
      <div class="color-panel__swatches" id="color-swatches"></div>
      <div class="color-panel__recent">
        <label class="color-panel__group-label">Recientes</label>
        <div class="color-panel__swatches" id="color-recent"></div>
      </div>
    </div>
  `;

  renderSwatches();
  renderRecentColors();
  bindEvents();
}

function renderSwatches() {
  const swatchContainer = container.querySelector('#color-swatches');
  if (!swatchContainer) return;
  SWATCHES.forEach((hex) => {
    const swatch = document.createElement('button');
    swatch.className = 'color-panel__swatch';
    swatch.style.background = hex;
    if (hex === '#ffffff') swatch.classList.add('color-panel__swatch--light');
    swatch.title = hex;
    swatch.addEventListener('click', () => applyColor(hex));
    swatchContainer.appendChild(swatch);
  });
}

function bindEvents() {
  container.querySelectorAll('.color-panel__mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      colorMode = btn.dataset.mode;
      container.querySelectorAll('.color-panel__mode-btn').forEach((b) =>
        b.classList.toggle('color-panel__mode-btn--active', b === btn)
      );
      syncFromSelection();
    });
  });

  container.querySelectorAll('.color-panel__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      container.querySelectorAll('.color-panel__tab').forEach((t) =>
        t.classList.toggle('color-panel__tab--active', t === tab)
      );
      container.querySelectorAll('.color-panel__tab-content').forEach((content) => {
        content.style.display = content.id === `tab-${activeTab}` ? '' : 'none';
      });
      updateSlidersFromColor();
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

  container.querySelector('#color-alpha')?.addEventListener('input', (e) => {
    currentAlpha = Number(e.target.value) / 100;
    const alphaValue = container.querySelector('#color-alpha-value');
    if (alphaValue) alphaValue.textContent = e.target.value + '%';
    applyColorToSelection();
  });

  ['r', 'g', 'b'].forEach(channel => {
    const slider = container.querySelector(`#slider-${channel}`);
    const input = container.querySelector(`#input-${channel}`);
    if (slider) {
      slider.addEventListener('input', () => {
        input.value = slider.value;
        updateColorFromRgbSliders();
      });
    }
    if (input) {
      input.addEventListener('change', () => {
        slider.value = input.value;
        updateColorFromRgbSliders();
      });
    }
  });

  ['h', 's', 'l'].forEach(channel => {
    const slider = container.querySelector(`#slider-${channel}`);
    const input = container.querySelector(`#input-${channel}`);
    if (slider) {
      slider.addEventListener('input', () => {
        input.value = slider.value;
        updateColorFromHslSliders();
      });
    }
    if (input) {
      input.addEventListener('change', () => {
        slider.value = input.value;
        updateColorFromHslSliders();
      });
    }
  });

  const alphaSlider = container.querySelector('#slider-alpha');
  const alphaInput = container.querySelector('#input-alpha');
  if (alphaSlider) {
    alphaSlider.addEventListener('input', () => {
      alphaInput.value = alphaSlider.value;
      currentAlpha = Number(alphaSlider.value) / 100;
      applyColorToSelection();
    });
  }
  if (alphaInput) {
    alphaInput.addEventListener('change', () => {
      alphaSlider.value = alphaInput.value;
      currentAlpha = Number(alphaInput.value) / 100;
      applyColorToSelection();
    });
  }
}

function updateColorFromRgbSliders() {
  const r = Number(container.querySelector('#input-r')?.value || 0);
  const g = Number(container.querySelector('#input-g')?.value || 0);
  const b = Number(container.querySelector('#input-b')?.value || 0);
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  
  container.querySelector('#slider-h').value = hsl.h;
  container.querySelector('#input-h').value = hsl.h;
  container.querySelector('#slider-s').value = hsl.s;
  container.querySelector('#input-s').value = hsl.s;
  container.querySelector('#slider-l').value = hsl.l;
  container.querySelector('#input-l').value = hsl.l;
  
  applyColor(hex);
}

function updateColorFromHslSliders() {
  const h = Number(container.querySelector('#input-h')?.value || 0);
  const s = Number(container.querySelector('#input-s')?.value || 0);
  const l = Number(container.querySelector('#input-l')?.value || 0);
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  container.querySelector('#slider-r').value = rgb.r;
  container.querySelector('#input-r').value = rgb.r;
  container.querySelector('#slider-g').value = rgb.g;
  container.querySelector('#input-g').value = rgb.g;
  container.querySelector('#slider-b').value = rgb.b;
  container.querySelector('#input-b').value = rgb.b;
  
  applyColor(hex);
}

function updateSlidersFromColor() {
  const rgb = hexToRgb(currentColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const setSlider = (id, value) => {
    const el = container.querySelector(`#${id}`);
    if (el) el.value = value;
  };
  
  setSlider('slider-r', rgb.r);
  setSlider('input-r', rgb.r);
  setSlider('slider-g', rgb.g);
  setSlider('input-g', rgb.g);
  setSlider('slider-b', rgb.b);
  setSlider('input-b', rgb.b);
  
  setSlider('slider-h', hsl.h);
  setSlider('input-h', hsl.h);
  setSlider('slider-s', hsl.s);
  setSlider('input-s', hsl.s);
  setSlider('slider-l', hsl.l);
  setSlider('input-l', hsl.l);
  
  setSlider('slider-alpha', Math.round(currentAlpha * 100));
  setSlider('input-alpha', Math.round(currentAlpha * 100));
  setSlider('color-alpha', Math.round(currentAlpha * 100));
  
  const alphaValue = container.querySelector('#color-alpha-value');
  if (alphaValue) alphaValue.textContent = Math.round(currentAlpha * 100) + '%';
}

function applyColor(hex) {
  currentColor = hex;
  addRecentColor(hex);
  updateInputs(hex);
  updateSlidersFromColor();
  applyColorToSelection();
}

function applyColorToSelection() {
  const canvas = editor.canvas;
  if (!canvas) return;

  const active = canvas.getActiveObject();
  if (active) {
    const colorValue = currentAlpha < 1 ? hexToRgba(currentColor, currentAlpha) : currentColor;
    if (colorMode === 'fill') {
      active.set('fill', colorValue);
    } else {
      active.set('stroke', colorValue);
      if (!active.strokeWidth) active.set('strokeWidth', 2);
    }
    canvas.renderAll();
  }

  bus.emit('color:change', { type: colorMode, color: currentColor, alpha: currentAlpha });
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
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
    updateSlidersFromColor();
  }
}