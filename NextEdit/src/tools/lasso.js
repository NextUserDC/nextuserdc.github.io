import * as fabric from 'fabric';
import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

let isDrawing = false;
let points = [];
let overlay = null;

const OVERLAY_STYLE = {
  stroke: '#4488ff',
  strokeWidth: 1,
  strokeDashArray: [5, 3],
  fill: 'rgba(68,136,255,0.08)',
  selectable: false,
  evented: false,
  excludeFromExport: true,
  objectCaching: false,
};

function createOverlay() {
  const canvas = editor.canvas;
  if (overlay) { canvas.remove(overlay); overlay = null; }
  if (points.length < 3) return;

  overlay = new fabric.Polygon(points, { ...OVERLAY_STYLE });
  canvas.add(overlay);
  canvas.renderAll();
}

function findObjectsInside(polyPoints) {
  const objects = editor.canvas.getObjects().filter(o => !o.excludeFromExport && o.selectable);
  return objects.filter(obj => {
    const center = obj.getCenterPoint();
    return fabric.util.isPointInPolygon(center, polyPoints);
  });
}

export default {
  name: 'lasso',
  icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12c0-4 3-7 7-7s5 3 5 5-2 4-4 5c-1.5.7-3 .5-4-.5s-1.5-2.5-.5-4"/><circle cx="6" cy="14" r="2"/></svg>`,
  shortcut: 'l',

  activate() {
    isDrawing = false;
    points = [];
    overlay = null;
    editor.canvas.selection = false;
    editor.canvas.setCursor('crosshair');
  },

  deactivate() {
    isDrawing = false;
    points = [];
    if (overlay) { editor.canvas.remove(overlay); overlay = null; }
    editor.canvas.setCursor('default');
  },

  onMouseDown(e) {
    const pointer = editor.canvas.getScenePoint(e.e);
    isDrawing = true;
    points = [{ x: pointer.x, y: pointer.y }];
  },

  onMouseMove(e) {
    if (!isDrawing) return;
    const pointer = editor.canvas.getScenePoint(e.e);
    points.push({ x: pointer.x, y: pointer.y });
    createOverlay();
  },

  onMouseUp() {
    if (!isDrawing) return;
    isDrawing = false;

    if (points.length < 3) {
      if (overlay) { editor.canvas.remove(overlay); overlay = null; }
      editor.canvas.discardActiveObject(); editor.canvas.renderAll();
      return;
    }

    points.push({ x: points[0].x, y: points[0].y });
    const hits = findObjectsInside(points);

    if (overlay) { editor.canvas.remove(overlay); overlay = null; }

    if (hits.length > 0) {
      editor.canvas.setActiveObject(new fabric.ActiveSelection(hits, { canvas: editor.canvas }));
    } else {
      editor.canvas.discardActiveObject();
    }
    editor.canvas.renderAll();
  },

  getOptionsHTML() {
    return `<div class="optionsbar__group"><span class="optionsbar__label" style="font-size:11px;color:var(--text-muted)">Dibuja un polígono libre</span></div>`;
  }
};
