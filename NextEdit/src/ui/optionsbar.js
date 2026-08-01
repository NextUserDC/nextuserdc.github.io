import { bus } from '../core/events.js';

const optionConfigs = {
  move: () => '',
  marquee: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Selección</span>
      <select class="optionsbar__select" data-option="marquee-mode">
        <option value="rect">Rectángulo</option>
        <option value="ellipse">Elipse</option>
      </select>
    </div>
  `,
  lasso: () => '',
  brush: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Tamaño</span>
      <input type="range" class="optionsbar__input" data-option="brush-size" min="1" max="200" value="10" style="width:100px">
      <input type="number" class="optionsbar__input" data-option="brush-size-num" min="1" max="200" value="10" style="width:48px">
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Opacidad</span>
      <input type="range" class="optionsbar__input" data-option="brush-opacity" min="1" max="100" value="100" style="width:80px">
      <input type="number" class="optionsbar__input" data-option="brush-opacity-num" min="1" max="100" value="100" style="width:48px">
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Color</span>
      <input type="color" class="optionsbar__input" data-option="brush-color" value="#000000" style="width:32px;height:24px;padding:0;border:none;cursor:pointer">
    </div>
  `,
  eraser: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Tamaño</span>
      <input type="range" class="optionsbar__input" data-option="eraser-size" min="1" max="200" value="20" style="width:100px">
      <input type="number" class="optionsbar__input" data-option="eraser-size-num" min="1" max="200" value="20" style="width:48px">
    </div>
  `,
  text: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Fuente</span>
      <select class="optionsbar__select" data-option="text-font">
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
        <option value="Impact">Impact</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
      </select>
    </div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Tamaño</span>
      <input type="number" class="optionsbar__input" data-option="text-size" min="1" max="500" value="24" style="width:48px">
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group" style="gap:4px">
      <button class="optionsbar__btn" data-option="text-bold" data-tooltip="Negrita">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h5a3 3 0 012 5 3 3 0 01-2 5H4V2zm2 7h3a1 1 0 000-2H6v2zm0-4v2h3a1 1 0 000-2H6z"/></svg>
      </button>
      <button class="optionsbar__btn" data-option="text-italic" data-tooltip="Cursiva">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h6v2h-2.2l-2.6 8H10v2H4v-2h2.2l2.6-8H6V2z"/></svg>
      </button>
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Color</span>
      <input type="color" class="optionsbar__input" data-option="text-color" value="#000000" style="width:32px;height:24px;padding:0;border:none;cursor:pointer">
    </div>
  `,
  shapes: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Forma</span>
      <select class="optionsbar__select" data-option="shape-type">
        <option value="rect">Rectángulo</option>
        <option value="circle">Círculo</option>
        <option value="triangle">Triángulo</option>
        <option value="line">Línea</option>
      </select>
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Relleno</span>
      <input type="color" class="optionsbar__input" data-option="shape-fill" value="#7c3aed" style="width:32px;height:24px;padding:0;border:none;cursor:pointer">
    </div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Trazo</span>
      <input type="color" class="optionsbar__input" data-option="shape-stroke" value="#000000" style="width:32px;height:24px;padding:0;border:none;cursor:pointer">
    </div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Grosor</span>
      <input type="number" class="optionsbar__input" data-option="shape-stroke-width" min="0" max="100" value="2" style="width:48px">
    </div>
  `,
  crop: () => `
    <div class="optionsbar__group">
      <span class="optionsbar__label">Ancho</span>
      <input type="number" class="optionsbar__input" data-option="crop-w" min="1" value="800" style="width:56px">
    </div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Alto</span>
      <input type="number" class="optionsbar__input" data-option="crop-h" min="1" value="600" style="width:56px">
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <span class="optionsbar__label">Relación</span>
      <select class="optionsbar__select" data-option="crop-ratio">
        <option value="free">Libre</option>
        <option value="1:1">1:1</option>
        <option value="4:3">4:3</option>
        <option value="16:9">16:9</option>
        <option value="3:2">3:2</option>
      </select>
    </div>
  `,
  eyedropper: () => '',
  zoom: () => `
    <div class="optionsbar__group" style="gap:4px">
      <button class="optionsbar__btn" id="opt-zoom-in" data-tooltip="Acercar">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/><path d="M5 7h4M7 5v4"/></svg>
      </button>
      <button class="optionsbar__btn" id="opt-zoom-out" data-tooltip="Alejar">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/><path d="M5 7h4"/></svg>
      </button>
    </div>
  `
};

export function getOptionsHTML(toolName) {
  const generator = optionConfigs[toolName];
  return generator ? generator() : '';
}

export function updateOptionsBar(toolName) {
  const optionsbar = document.getElementById('optionsbar');
  if (!optionsbar) return;

  optionsbar.innerHTML = getOptionsHTML(toolName);

  if (toolName === 'brush') {
    initBrushOptions(optionsbar);
  } else if (toolName === 'eraser') {
    initEraserOptions(optionsbar);
  } else if (toolName === 'text') {
    initTextOptions(optionsbar);
  } else if (toolName === 'shapes') {
    initShapesOptions(optionsbar);
  } else if (toolName === 'crop') {
    initCropOptions(optionsbar);
  } else if (toolName === 'zoom') {
    initZoomOptions(optionsbar);
  }
}

function initBrushOptions(container) {
  const sizeRange = container.querySelector('[data-option="brush-size"]');
  const sizeNum = container.querySelector('[data-option="brush-size-num"]');
  const opacityRange = container.querySelector('[data-option="brush-opacity"]');
  const opacityNum = container.querySelector('[data-option="brush-opacity-num"]');
  const color = container.querySelector('[data-option="brush-color"]');

  if (sizeRange && sizeNum) {
    sizeRange.addEventListener('input', () => {
      sizeNum.value = sizeRange.value;
      bus.emit('tool:option', { key: 'brushSize', value: Number(sizeRange.value) });
    });
    sizeNum.addEventListener('input', () => {
      sizeRange.value = sizeNum.value;
      bus.emit('tool:option', { key: 'brushSize', value: Number(sizeNum.value) });
    });
  }

  if (opacityRange && opacityNum) {
    opacityRange.addEventListener('input', () => {
      opacityNum.value = opacityRange.value;
      bus.emit('tool:option', { key: 'brushOpacity', value: Number(opacityRange.value) });
    });
    opacityNum.addEventListener('input', () => {
      opacityRange.value = opacityNum.value;
      bus.emit('tool:option', { key: 'brushOpacity', value: Number(opacityNum.value) });
    });
  }

  if (color) {
    color.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'brushColor', value: color.value });
      bus.emit('color:change', { color: color.value });
    });
  }
}

function initEraserOptions(container) {
  const sizeRange = container.querySelector('[data-option="eraser-size"]');
  const sizeNum = container.querySelector('[data-option="eraser-size-num"]');

  if (sizeRange && sizeNum) {
    sizeRange.addEventListener('input', () => {
      sizeNum.value = sizeRange.value;
      bus.emit('tool:option', { key: 'eraserSize', value: Number(sizeRange.value) });
    });
    sizeNum.addEventListener('input', () => {
      sizeRange.value = sizeNum.value;
      bus.emit('tool:option', { key: 'eraserSize', value: Number(sizeNum.value) });
    });
  }
}

function initTextOptions(container) {
  const font = container.querySelector('[data-option="text-font"]');
  const size = container.querySelector('[data-option="text-size"]');
  const bold = container.querySelector('[data-option="text-bold"]');
  const italic = container.querySelector('[data-option="text-italic"]');
  const color = container.querySelector('[data-option="text-color"]');

  if (font) {
    font.addEventListener('change', () => {
      bus.emit('tool:option', { key: 'textFont', value: font.value });
    });
  }

  if (size) {
    size.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'textSize', value: Number(size.value) });
    });
  }

  if (bold) {
    bold.addEventListener('click', () => {
      bold.classList.toggle('optionsbar__btn--active');
      bus.emit('tool:option', { key: 'textBold', value: bold.classList.contains('optionsbar__btn--active') });
    });
  }

  if (italic) {
    italic.addEventListener('click', () => {
      italic.classList.toggle('optionsbar__btn--active');
      bus.emit('tool:option', { key: 'textItalic', value: italic.classList.contains('optionsbar__btn--active') });
    });
  }

  if (color) {
    color.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'textColor', value: color.value });
      bus.emit('color:change', { color: color.value });
    });
  }
}

function initShapesOptions(container) {
  const type = container.querySelector('[data-option="shape-type"]');
  const fill = container.querySelector('[data-option="shape-fill"]');
  const stroke = container.querySelector('[data-option="shape-stroke"]');
  const strokeWidth = container.querySelector('[data-option="shape-stroke-width"]');

  if (type) {
    type.addEventListener('change', () => {
      bus.emit('tool:option', { key: 'shapeType', value: type.value });
    });
  }

  if (fill) {
    fill.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'shapeFill', value: fill.value });
    });
  }

  if (stroke) {
    stroke.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'shapeStroke', value: stroke.value });
    });
  }

  if (strokeWidth) {
    strokeWidth.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'shapeStrokeWidth', value: Number(strokeWidth.value) });
    });
  }
}

function initCropOptions(container) {
  const w = container.querySelector('[data-option="crop-w"]');
  const h = container.querySelector('[data-option="crop-h"]');
  const ratio = container.querySelector('[data-option="crop-ratio"]');

  if (ratio) {
    ratio.addEventListener('change', () => {
      bus.emit('tool:option', { key: 'cropRatio', value: ratio.value });
      if (ratio.value !== 'free' && w && h) {
        const [rw, rh] = ratio.value.split(':').map(Number);
        if (rw && rh) {
          const newH = Math.round(Number(w.value) * rh / rw);
          h.value = newH;
          bus.emit('tool:option', { key: 'cropH', value: newH });
        }
      }
    });
  }

  if (w) {
    w.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'cropW', value: Number(w.value) });
      if (ratio && ratio.value !== 'free' && h) {
        const [rw, rh] = ratio.value.split(':').map(Number);
        if (rw && rh) {
          h.value = Math.round(Number(w.value) * rh / rw);
          bus.emit('tool:option', { key: 'cropH', value: Number(h.value) });
        }
      }
    });
  }

  if (h) {
    h.addEventListener('input', () => {
      bus.emit('tool:option', { key: 'cropH', value: Number(h.value) });
      if (ratio && ratio.value !== 'free' && w) {
        const [rw, rh] = ratio.value.split(':').map(Number);
        if (rw && rh) {
          w.value = Math.round(Number(h.value) * rw / rh);
          bus.emit('tool:option', { key: 'cropW', value: Number(w.value) });
        }
      }
    });
  }
}

function initZoomOptions(container) {
  const zoomIn = container.querySelector('#opt-zoom-in');
  const zoomOut = container.querySelector('#opt-zoom-out');

  if (zoomIn) {
    zoomIn.addEventListener('click', () => bus.emit('view:zoom-in'));
  }

  if (zoomOut) {
    zoomOut.addEventListener('click', () => bus.emit('view:zoom-out'));
  }
}
