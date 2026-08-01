import * as fabric from 'fabric';
import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

let isDrawing = false;
let startX = 0;
let startY = 0;
let overlay = null;
let mode = 'rect';

const OVERLAY_STYLE = {
  stroke: '#4488ff',
  strokeWidth: 1,
  strokeDashArray: [5, 3],
  fill: 'rgba(68,136,255,0.08)',
  selectable: false,
  evented: false,
  excludeFromExport: true,
};

function createOverlay(x, y, w, h) {
  const canvas = editor.canvas;
  if (overlay) { canvas.remove(overlay); overlay = null; }

  if (mode === 'ellipse') {
    overlay = new fabric.Ellipse({
      left: Math.min(x, x + w), top: Math.min(y, y + h),
      rx: Math.abs(w) / 2, ry: Math.abs(h) / 2,
      ...OVERLAY_STYLE,
    });
  } else {
    overlay = new fabric.Rect({
      left: Math.min(x, x + w), top: Math.min(y, y + h),
      width: Math.abs(w), height: Math.abs(h),
      ...OVERLAY_STYLE,
    });
  }
  canvas.add(overlay);
  canvas.renderAll();
}

function findIntersecting(bounds) {
  const objects = editor.canvas.getObjects().filter(o => !o.excludeFromExport && o.selectable);
  return objects.filter(obj => {
    const b = obj.getBoundingRect();
    return bounds.left < b.left + b.width && bounds.left + bounds.width > b.left &&
           bounds.top < b.top + b.height && bounds.top + bounds.height > b.top;
  });
}

export default {
  name: 'marquee',
  icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"><rect x="3" y="3" width="14" height="14" rx="1"/></svg>`,
  shortcut: 'm',

  activate() {
    isDrawing = false;
    overlay = null;
    editor.canvas.selection = false;
    editor.canvas.setCursor('crosshair');
  },

  deactivate() {
    isDrawing = false;
    if (overlay) { editor.canvas.remove(overlay); overlay = null; }
    editor.canvas.setCursor('default');
  },

  onMouseDown(e) {
    const pointer = editor.canvas.getScenePoint(e.e);
    isDrawing = true;
    startX = pointer.x;
    startY = pointer.y;
  },

  onMouseMove(e) {
    if (!isDrawing) return;
    const pointer = editor.canvas.getScenePoint(e.e);
    createOverlay(startX, startY, pointer.x - startX, pointer.y - startY);
  },

  onMouseUp() {
    if (!isDrawing) return;
    isDrawing = false;
    if (!overlay) return;

    const bounds = overlay.getBoundingRect();
    if (bounds.width < 2 && bounds.height < 2) {
      editor.canvas.remove(overlay); overlay = null;
      editor.canvas.discardActiveObject(); editor.canvas.renderAll();
      return;
    }

    const hits = findIntersecting(bounds);
    editor.canvas.remove(overlay); overlay = null;

    if (hits.length > 0) {
      editor.canvas.setActiveObject(new fabric.ActiveSelection(hits, { canvas: editor.canvas }));
    } else {
      editor.canvas.discardActiveObject();
    }
    editor.canvas.renderAll();
  },

  getOptionsHTML() {
    return `
      <div class="optionsbar__group">
        <span class="optionsbar__label">Modo</span>
        <select class="optionsbar__select" data-option="marquee-mode">
          <option value="rect" ${mode === 'rect' ? 'selected' : ''}>Rectangular</option>
          <option value="ellipse" ${mode === 'ellipse' ? 'selected' : ''}>Elíptico</option>
        </select>
      </div>
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'marquee-mode') mode = data.value;
});
