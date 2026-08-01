import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.25;

function getZoom() {
  return editor.canvas.getZoom();
}

function setZoom(zoom, point) {
  const canvas = editor.canvas;
  zoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM);

  if (point) {
    canvas.zoomToPoint(point, zoom);
  } else {
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, zoom);
  }
  canvas.requestRenderAll();
  bus.emit('zoom:change', { zoom });
}

export default {
  name: 'zoom',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/><path d="M7 9h4M9 7v4"/></svg>`,
  shortcut: 'z',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.setCursor('zoom-in');
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  },

  deactivate() {
    const canvas = editor.canvas;
    canvas.setCursor('default');
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);
    const currentZoom = getZoom();

    if (e.e.altKey) {
      setZoom(currentZoom * (1 - ZOOM_STEP), { x: pointer.x, y: pointer.y });
    } else {
      setZoom(currentZoom * (1 + ZOOM_STEP), { x: pointer.x, y: pointer.y });
    }
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div class="tool-options-group">
        <button id="zoom-in" class="tool-btn" title="Acercar">+</button>
        <button id="zoom-out" class="tool-btn" title="Alejar">−</button>
        <button id="zoom-fit" class="tool-btn" title="Ajustar">Ajustar</button>
        <button id="zoom-100" class="tool-btn" title="100%">100%</button>
      </div>
    `;
  }
};

bus.on('tool:optionsBind', (data) => {
  if (data.tool !== 'zoom') return;

  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomFitBtn = document.getElementById('zoom-fit');
  const zoom100Btn = document.getElementById('zoom-100');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      const canvas = editor.canvas;
      const center = canvas.getCenterPoint();
      setZoom(getZoom() * (1 + ZOOM_STEP), center);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      const canvas = editor.canvas;
      const center = canvas.getCenterPoint();
      setZoom(getZoom() * (1 - ZOOM_STEP), center);
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', () => {
      const canvas = editor.canvas;
      const vpt = canvas.viewportTransform;
      vpt[4] = 0;
      vpt[5] = 0;
      canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
      bus.emit('zoom:change', { zoom: 1 });
    });
  }

  if (zoom100Btn) {
    zoom100Btn.addEventListener('click', () => {
      const canvas = editor.canvas;
      const center = canvas.getCenterPoint();
      setZoom(1, center);
    });
  }
});
