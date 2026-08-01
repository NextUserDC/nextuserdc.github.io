import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let shapeType = 'rect';
let fillColor = '#000000';
let strokeColor = '#000000';
let strokeWidth = 2;
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

  switch (shapeType) {
    case 'rect':
      return new fabric.Rect({ ...baseOpts, width, height });
    case 'circle': {
      const radius = Math.sqrt(width * width + height * height) / 2;
      return new fabric.Circle({ ...baseOpts, radius, left: x1, top: y1 });
    }
    case 'triangle':
      return new fabric.Triangle({ ...baseOpts, width, height });
    case 'line':
      return new fabric.Line([x1, y1, x2, y2], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false
      });
    default:
      return null;
  }
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
    return `
      <div class="tool-options-group">
        <label>Tipo</label>
        <select id="shape-type">
          <option value="rect" ${shapeType === 'rect' ? 'selected' : ''}>Rectángulo</option>
          <option value="circle" ${shapeType === 'circle' ? 'selected' : ''}>Círculo</option>
          <option value="triangle" ${shapeType === 'triangle' ? 'selected' : ''}>Triángulo</option>
          <option value="line" ${shapeType === 'line' ? 'selected' : ''}>Línea</option>
        </select>
      </div>
      <div class="tool-options-group">
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
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'shapeType') shapeType = data.value;
  else if (data.key === 'shapeFill') fillColor = data.value;
  else if (data.key === 'shapeStroke') strokeColor = data.value;
  else if (data.key === 'shapeStrokeWidth') strokeWidth = parseInt(data.value, 10) || 0;
});
