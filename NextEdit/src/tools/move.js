import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

export default {
  name: 'move',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v16M2 10h16M10 2l-3 3M10 2l3 3M10 18l-3-3M10 18l3-3M2 10l3-3M2 10l3 3M18 10l-3-3M18 10l-3 3"/></svg>`,
  shortcut: 'v',

  activate() {
    const canvas = editor.canvas;
    canvas.selection = true;
    canvas.isDrawingMode = false;
    canvas.freeDrawingBrush = null;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    canvas.setCursor('default');
  },

  deactivate() {
    const canvas = editor.canvas;
    canvas.discardActiveObject();
    canvas.renderAll();
  },

  onMouseDown() {},
  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return '';
  }
};
