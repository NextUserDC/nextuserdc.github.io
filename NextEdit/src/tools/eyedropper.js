import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';
import { rgbToHex } from '../utils/color.js';

let pickedColor = null;

function getPixelColor(e) {
  const canvas = editor.canvas;
  const pointer = canvas.getScenePoint(e.e);
  const ctx = canvas.contextContainer;
  const pixel = ctx.getImageData(
    Math.round(pointer.x),
    Math.round(pointer.y),
    1,
    1
  ).data;
  return rgbToHex(pixel[0], pixel[1], pixel[2]);
}

export default {
  name: 'eyedropper',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3l2 2-3 3-2-2z"/><path d="M12 6L4 18H2v-2l8-8z"/><circle cx="14" cy="4" r="1.5" fill="currentColor"/></svg>`,
  shortcut: 'i',

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
    canvas.setCursor('default');
  },

  onMouseDown(e) {
    pickedColor = getPixelColor(e);
    if (pickedColor) {
      bus.emit('color:picked', { color: pickedColor });
      bus.emit('color:primary', { color: pickedColor });
      navigator.clipboard.writeText(pickedColor).catch(() => {});
    }
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    const display = pickedColor || '#000000';
    return `
      <div class="tool-options-group">
        <label>Color seleccionado</label>
        <div style="display:flex;align-items:center;gap:6px;">
          <div id="eyedropper-preview" style="width:24px;height:24px;border-radius:4px;border:1px solid #ccc;background:${display};"></div>
          <span id="eyedropper-hex">${display}</span>
        </div>
      </div>
    `;
  }
};
