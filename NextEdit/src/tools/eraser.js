import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let eraserSize = 20;

export default {
  name: 'eraser',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7l-6 6-4-4-3 3"/><path d="M3 17h14"/><path d="M7 13l-4 4"/></svg>`,
  shortcut: 'e',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = true;
    const brush = new fabric.PencilBrush(canvas);
    brush.color = 'rgba(255,255,255,1)';
    brush.width = eraserSize;
    canvas.freeDrawingBrush = brush;
  },

  deactivate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.freeDrawingBrush = null;
  },

  onMouseDown(e) {},
  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div class="tool-options-group">
        <label>Tamaño</label>
        <input type="range" data-option="eraser-size" min="1" max="200" value="${eraserSize}" style="width:100px">
        <input type="number" data-option="eraser-size-num" min="1" max="200" value="${eraserSize}" style="width:48px">
      </div>
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'eraserSize') {
    eraserSize = parseInt(data.value, 10);
    const canvas = editor.canvas;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = eraserSize;
    }
  }
});
