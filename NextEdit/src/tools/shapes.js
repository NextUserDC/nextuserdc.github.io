import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let shapeType = 'rect';
let fillColor = '#000000';
let strokeColor = '#000000';
let strokeWidth = 2;
let cornerRadius = 0;
let polygonSides = 6;
let starPoints = 5;
let starInnerRatio = 0.4;
let isDrawing = false;
let startX = 0;
let startY = 0;
let previewObj = null;

function createShape(x1, y1, x2, y2) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  if (width < 2 && height < 2) return null;

  const baseOpts = {
    left,
    top,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false
  };

  const cx = left + width / 2;
  const cy = top + height / 2;
  const r = Math.min(width, height) / 2;

  switch (shapeType) {
    case 'rect':
      return new fabric.Rect({
        ...baseOpts,
        width,
        height,
        rx: cornerRadius,
        ry: cornerRadius
      });
    case 'circle':
      return new fabric.Circle({
        ...baseOpts,
        radius: r,
        left: cx,
        top: cy
      });
    case 'triangle':
      return new fabric.Triangle({ ...baseOpts, width, height });
    case 'line':
      return new fabric.Line([x1, y1, x2, y2], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false
      });
    case 'polygon':
      return createPolygon(cx, cy, r, polygonSides, baseOpts);
    case 'star':
      return createStar(cx, cy, r, r * starInnerRatio, starPoints, baseOpts);
    case 'arrow':
      return createArrow(x1, y1, x2, y2);
    case 'heart':
      return createHeart(cx, cy, Math.min(width, height), baseOpts);
    default:
      return null;
  }
}

function createPolygon(cx, cy, r, sides, baseOpts) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return new fabric.Polygon(points, { ...baseOpts });
}

function createStar(cx, cy, outerR, innerR, points, baseOpts) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const rad = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle) });
  }
  return new fabric.Polygon(pts, { ...baseOpts });
}

function createArrow(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const headLen = Math.min(20, len * 0.3);
  const angle = Math.atan2(dy, dx);

  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    selectable: false,
    evented: false
  });

  const head1 = new fabric.Triangle({
    left: x2, top: y2,
    width: headLen, height: headLen,
    fill: strokeColor,
    angle: (angle * 180 / Math.PI) + 90,
    originX: 'center', originY: 'center',
    selectable: false, evented: false
  });

  return new fabric.Group([line, head1], {
    selectable: false,
    evented: false
  });
}

function createHeart(cx, cy, size, baseOpts) {
  const path = `M ${cx} ${cy + size * 0.3} C ${cx - size * 0.5} ${cy - size * 0.1} ${cx - size * 0.5} ${cy - size * 0.5} ${cx} ${cy - size * 0.25} C ${cx + size * 0.5} ${cy - size * 0.5} ${cx + size * 0.5} ${cy - size * 0.1} ${cx} ${cy + size * 0.3} Z`;
  return new fabric.Path(path, { ...baseOpts });
}

export default {
  name: 'shapes',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="1"/></svg>`,
  shortcut: 'u',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.setCursor('crosshair');
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  },

  deactivate() {
    const canvas = editor.canvas;
    isDrawing = false;
    if (previewObj) {
      canvas.remove(previewObj);
      previewObj = null;
    }
    canvas.setCursor('default');
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);
    isDrawing = true;
    startX = pointer.x;
    startY = pointer.y;
  },

  onMouseMove(e) {
    if (!isDrawing) return;
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);

    if (previewObj) {
      canvas.remove(previewObj);
    }

    previewObj = createShape(startX, startY, pointer.x, pointer.y);
    if (previewObj) {
      canvas.add(previewObj);
      canvas.renderAll();
    }
  },

  onMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    const canvas = editor.canvas;

    if (previewObj) {
      canvas.remove(previewObj);
      previewObj = null;
    }

    const pointer = canvas.getScenePoint(e.e);
    const finalShape = createShape(startX, startY, pointer.x, pointer.y);
    if (finalShape) {
      finalShape.set({ selectable: true, evented: true });
      canvas.add(finalShape);
      canvas.setActiveObject(finalShape);
      canvas.renderAll();
    }
  },

  getOptionsHTML() {
    const isRect = shapeType === 'rect';
    const isPolygon = shapeType === 'polygon';
    const isStar = shapeType === 'star';
    const isLineOrArrow = shapeType === 'line' || shapeType === 'arrow';

    return `
      <div class="tool-options-group">
        <label>Tipo</label>
        <select id="shape-type">
          <option value="rect" ${shapeType === 'rect' ? 'selected' : ''}>Rectángulo</option>
          <option value="circle" ${shapeType === 'circle' ? 'selected' : ''}>Círculo</option>
          <option value="triangle" ${shapeType === 'triangle' ? 'selected' : ''}>Triángulo</option>
          <option value="line" ${shapeType === 'line' ? 'selected' : ''}>Línea</option>
          <option value="polygon" ${shapeType === 'polygon' ? 'selected' : ''}>Polígono</option>
          <option value="star" ${shapeType === 'star' ? 'selected' : ''}>Estrella</option>
          <option value="arrow" ${shapeType === 'arrow' ? 'selected' : ''}>Flecha</option>
          <option value="heart" ${shapeType === 'heart' ? 'selected' : ''}>Corazón</option>
        </select>
      </div>
      <div class="tool-options-group" style="${isLineOrArrow ? 'display:none' : ''}">
        <label>Relleno</label>
        <input type="color" id="shape-fill" value="${fillColor}" />
      </div>
      <div class="tool-options-group">
        <label>Trazo</label>
        <input type="color" id="shape-stroke" value="${strokeColor}" />
      </div>
      <div class="tool-options-group">
        <label>Grosor</label>
        <input type="number" id="shape-strokeWidth" min="0" max="50" value="${strokeWidth}" />
      </div>
      <div class="tool-options-group" style="${isRect ? '' : 'display:none'}">
        <label>Radio esquinas</label>
        <input type="number" id="shape-cornerRadius" min="0" max="100" value="${cornerRadius}" />
      </div>
      <div class="tool-options-group" style="${isPolygon ? '' : 'display:none'}">
        <label>Lados</label>
        <input type="number" id="shape-polygonSides" min="3" max="12" value="${polygonSides}" />
      </div>
      <div class="tool-options-group" style="${isStar ? '' : 'display:none'}">
        <label>Puntos</label>
        <input type="number" id="shape-starPoints" min="3" max="12" value="${starPoints}" />
      </div>
      <div class="tool-options-group" style="${isStar ? '' : 'display:none'}">
        <label>Radio interno</label>
        <input type="number" id="shape-starInnerRatio" min="0.1" max="0.9" step="0.1" value="${starInnerRatio}" />
      </div>
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'shapeType') shapeType = data.value;
  else if (data.key === 'shapeFill') fillColor = data.value;
  else if (data.key === 'shapeStroke') strokeColor = data.value;
  else if (data.key === 'shapeStrokeWidth') strokeWidth = parseInt(data.value, 10) || 0;
  else if (data.key === 'shapeCornerRadius') cornerRadius = parseInt(data.value, 10) || 0;
  else if (data.key === 'shapePolygonSides') polygonSides = Math.max(3, Math.min(12, parseInt(data.value, 10) || 6));
  else if (data.key === 'shapeStarPoints') starPoints = Math.max(3, Math.min(12, parseInt(data.value, 10) || 5));
  else if (data.key === 'shapeStarInnerRatio') starInnerRatio = Math.max(0.1, Math.min(0.9, parseFloat(data.value) || 0.4));
});
