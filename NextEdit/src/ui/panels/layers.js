import * as fabric from 'fabric';
import { bus } from '../../core/events.js';
import { editor } from '../../core/editor.js';

let container = null;
let unsubscribeFns = [];

export function initLayersPanel(containerEl) {
  container = containerEl;
  render();
  listen();
}

function listen() {
  const on = (ev, fn) => { unsubscribeFns.push(bus.on(ev, fn)); };
  on('canvas:object:added', refreshLayers);
  on('canvas:object:removed', refreshLayers);
  on('canvas:object:modified', refreshLayers);
  on('selection:created', refreshLayers);
  on('selection:cleared', refreshLayers);
  on('editor:undo', refreshLayers);
  on('editor:redo', refreshLayers);
}

function render() {
  if (!container) return;
  container.innerHTML = `
    <div class="layers__list" id="layers-list"></div>
    <div class="layers__actions">
      <button class="layers__action-btn" id="layer-new" data-tooltip="Nueva capa" title="Nueva capa">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10"/></svg>
      </button>
      <button class="layers__action-btn" id="layer-duplicate" data-tooltip="Duplicar" title="Duplicar">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="9" height="9" rx="1"/><path d="M3 12V3h9"/></svg>
      </button>
      <button class="layers__action-btn" id="layer-delete" data-tooltip="Eliminar" title="Eliminar">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
      </button>
      <button class="layers__action-btn" id="layer-up" data-tooltip="Subir" title="Subir">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10l4-4 4 4"/></svg>
      </button>
      <button class="layers__action-btn" id="layer-down" data-tooltip="Bajar" title="Bajar">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6l4 4 4-4"/></svg>
      </button>
    </div>
  `;

  container.querySelector('#layer-new')?.addEventListener('click', handleNew);
  container.querySelector('#layer-duplicate')?.addEventListener('click', handleDuplicate);
  container.querySelector('#layer-delete')?.addEventListener('click', handleDelete);
  container.querySelector('#layer-up')?.addEventListener('click', handleMoveUp);
  container.querySelector('#layer-down')?.addEventListener('click', handleMoveDown);

  refreshLayers();
}

export function refreshLayers() {
  if (!container) return;
  const list = container.querySelector('#layers-list');
  if (!list) return;

  const canvas = editor.canvas;
  if (!canvas) {
    list.innerHTML = '<div class="layers__empty">Sin capas</div>';
    return;
  }

  const objects = canvas.getObjects();
  const active = canvas.getActiveObject();

  list.innerHTML = '';

  if (objects.length === 0) {
    list.innerHTML = '<div class="layers__empty">Sin capas</div>';
    return;
  }

  [...objects].reverse().forEach((obj, idx) => {
    const realIndex = objects.length - 1 - idx;
    const item = document.createElement('div');
    item.className = 'layers__item';
    if (active && obj === active) {
      item.classList.add('layers__item--selected');
    }
    item.setAttribute('data-index', realIndex);

    const thumb = document.createElement('canvas');
    thumb.className = 'layers__thumb';
    thumb.width = 40;
    thumb.height = 40;
    drawThumbnail(thumb, obj);

    const info = document.createElement('div');
    info.className = 'layers__info';

    const name = document.createElement('span');
    name.className = 'layers__name';
    name.textContent = obj.name || getObjectLabel(obj);
    info.appendChild(name);

    const eyeBtn = document.createElement('button');
    eyeBtn.className = 'layers__eye';
    eyeBtn.innerHTML = obj.visible !== false
      ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>'
      : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><line x1="2" y1="2" x2="14" y2="14"/></svg>';
    eyeBtn.title = obj.visible !== false ? 'Ocultar' : 'Mostrar';
    eyeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      obj.set('visible', obj.visible === false ? true : false);
      canvas.renderAll();
      refreshLayers();
    });

    const row = document.createElement('div');
    row.className = 'layers__item-row';
    row.appendChild(name);
    row.appendChild(eyeBtn);

    const opacityRow = document.createElement('div');
    opacityRow.className = 'layers__opacity-row';
    const opLabel = document.createElement('span');
    opLabel.className = 'layers__opacity-label';
    opLabel.textContent = `${Math.round((obj.opacity ?? 1) * 100)}%`;
    const opSlider = document.createElement('input');
    opSlider.type = 'range';
    opSlider.className = 'layers__opacity-slider';
    opSlider.min = 0;
    opSlider.max = 100;
    opSlider.value = Math.round((obj.opacity ?? 1) * 100);
    opSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      obj.set('opacity', Number(e.target.value) / 100);
      opLabel.textContent = `${e.target.value}%`;
      canvas.renderAll();
    });
    opacityRow.appendChild(opLabel);
    opacityRow.appendChild(opSlider);

    info.appendChild(row);
    info.appendChild(opacityRow);

    item.appendChild(thumb);
    item.appendChild(info);

    item.addEventListener('click', () => {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      refreshLayers();
    });

    list.appendChild(item);
  });
}

function drawThumbnail(thumbCanvas, obj) {
  const ctx = thumbCanvas.getContext('2d');
  ctx.clearRect(0, 0, 40, 40);
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, 40, 40);

  try {
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = 40;
    cacheCanvas.height = 40;
    const cacheCtx = cacheCanvas.getContext('2d');

    const bounds = obj.getBoundingRect();
    const scale = Math.min(36 / (bounds.width || 1), 36 / (bounds.height || 1));
    const tempCanvas = new fabric.Canvas(null, { width: 40, height: 40 });
    const clone = fabric.util.object.clone(obj);
    clone.set({
      left: 20 - (bounds.width * scale) / 2 - bounds.left * scale,
      top: 20 - (bounds.height * scale) / 2 - bounds.top * scale,
      scaleX: (obj.scaleX || 1) * scale,
      scaleY: (obj.scaleY || 1) * scale,
      selectable: false,
      evented: false
    });
    tempCanvas.add(clone);
    tempCanvas.renderAll();
    ctx.drawImage(tempCanvas.lowerCanvasEl, 0, 0);
  } catch {
    ctx.fillStyle = '#555';
    ctx.fillRect(8, 8, 24, 24);
  }
}

function getObjectLabel(obj) {
  const type = obj.type || 'object';
  const labels = {
    rect: 'Rectángulo',
    circle: 'Círculo',
    triangle: 'Triángulo',
    'i-text': 'Texto',
    text: 'Texto',
    textbox: 'Textbox',
    image: 'Imagen',
    path: 'Trazo',
    line: 'Línea',
    polygon: 'Polígono',
    group: 'Grupo'
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function handleNew() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const rect = new fabric.Rect({
    left: 50,
    top: 50,
    width: 100,
    height: 100,
    fill: '#000000',
    name: 'Rectángulo'
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
}

function handleDuplicate() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active) return;
  active.clone((cloned) => {
    cloned.set({
      left: (active.left || 0) + 20,
      top: (active.top || 0) + 20
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
  });
}

function handleDelete() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active) return;
  if (active.type === 'activeSelection') {
    active.forEachObject((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
  } else {
    canvas.remove(active);
  }
  canvas.renderAll();
}

function handleMoveUp() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.bringObjectForward(active);
  canvas.renderAll();
  refreshLayers();
}

function handleMoveDown() {
  const canvas = editor.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObject();
  if (!active) return;
  canvas.sendObjectBackwards(active);
  canvas.renderAll();
  refreshLayers();
}
