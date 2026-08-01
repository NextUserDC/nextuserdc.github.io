import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let eraserSize = 20;

function applyEraserSettings() {
  const canvas = editor.canvas;
  if (!canvas.freeDrawingBrush) return;
  canvas.freeDrawingBrush.width = eraserSize;
}

export default {
  name: 'eraser',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l-3 3 4 4 3-3"/><path d="M17 7l-7 7"/><path d="M14 4l3 3-7 7H6v-3l7-7z"/></svg>`,
  shortcut: 'e',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#ffffff';
    applyEraserSettings();
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
        <input type="range" id="eraser-size" min="1" max="200" value="${eraserSize}" />
        <span id="eraser-size-val">${eraserSize}</span>
      </div>
    `;
  }
};

bus.on('tool:optionsBind', (data) => {
  if (data.tool !== 'eraser') return;

  const sizeInput = document.getElementById('eraser-size');
  const sizeVal = document.getElementById('eraser-size-val');

  if (sizeInput) {
    sizeInput.addEventListener('input', (e) => {
      eraserSize = parseInt(e.target.value, 10);
      sizeVal.textContent = eraserSize;
      applyEraserSettings();
    });
  }
});
