import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let brushSize = 10;
let brushColor = '#000000';
let brushOpacity = 1;

function applyBrushSettings() {
  const canvas = editor.canvas;
  if (!canvas.freeDrawingBrush) return;
  canvas.freeDrawingBrush.width = brushSize;
  canvas.freeDrawingBrush.color = brushColor;
  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: 0,
    offsetX: 0,
    offsetY: 0,
    color: brushColor,
    opacity: brushOpacity
  });
}

export default {
  name: 'brush',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l4-4M7 13l6-12 4 4-12 6z"/><circle cx="3" cy="17" r="1.5" fill="currentColor"/></svg>`,
  shortcut: 'b',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    applyBrushSettings();
  },

  deactivate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.freeDrawingBrush = null;
  },

  onMouseDown() {},
  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div class="tool-options-group">
        <label>Tamaño</label>
        <input type="range" id="brush-size" min="1" max="200" value="${brushSize}" />
        <span id="brush-size-val">${brushSize}</span>
      </div>
      <div class="tool-options-group">
        <label>Color</label>
        <input type="color" id="brush-color" value="${brushColor}" />
      </div>
      <div class="tool-options-group">
        <label>Opacidad</label>
        <input type="range" id="brush-opacity" min="0" max="100" value="${brushOpacity * 100}" />
        <span id="brush-opacity-val">${Math.round(brushOpacity * 100)}%</span>
      </div>
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'brushSize') {
    brushSize = parseInt(data.value, 10);
    applyBrushSettings();
  } else if (data.key === 'brushColor') {
    brushColor = data.value;
    applyBrushSettings();
  } else if (data.key === 'brushOpacity') {
    brushOpacity = parseInt(data.value, 10) / 100;
    applyBrushSettings();
  }
});
