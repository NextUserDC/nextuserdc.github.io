import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';
import * as fabric from 'fabric';

export default {
  name: 'marquee',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="0" stroke-dasharray="5 3"/></svg>`,
  shortcut: 'm',

  _selectionRect: null,
  _startX: 0,
  _startY: 0,

  activate() {
    const canvas = editor.canvas;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
  },

  deactivate() {
    this._removeOverlay();
    const canvas = editor.canvas;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);

    this._startX = pointer.x;
    this._startY = pointer.y;
    this._removeOverlay();

    this._selectionRect = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      stroke: '#00aaff',
      strokeWidth: 1,
      strokeDashArray: [5, 3],
      fill: 'rgba(0,170,255,0.08)',
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });

    canvas.add(this._selectionRect);
  },

  onMouseMove(e) {
    if (!this._selectionRect) return;
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);

    const left = Math.min(this._startX, pointer.x);
    const top = Math.min(this._startY, pointer.y);
    const width = Math.abs(pointer.x - this._startX);
    const height = Math.abs(pointer.y - this._startY);

    this._selectionRect.set({ left, top, width, height });
    canvas.renderAll();
  },

  onMouseUp() {
    if (!this._selectionRect) return;
    const canvas = editor.canvas;

    const selBounds = this._selectionRect.getBoundingRect();
    if (selBounds.width < 2 && selBounds.height < 2) {
      this._removeOverlay();
      return;
    }

    const intersecting = canvas.getObjects().filter((obj) => {
      if (obj === this._selectionRect) return false;
      const objBounds = obj.getBoundingRect();
      return (
        objBounds.left < selBounds.left + selBounds.width &&
        objBounds.left + objBounds.width > selBounds.left &&
        objBounds.top < selBounds.top + selBounds.height &&
        objBounds.top + objBounds.height > selBounds.top
      );
    });

    this._removeOverlay();

    if (intersecting.length > 0) {
      const selection = new fabric.ActiveSelection(intersecting, { canvas });
      canvas.setActiveObject(selection);
      canvas.renderAll();
    }

    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    bus.emit('tool:select', 'move');
  },

  _removeOverlay() {
    if (this._selectionRect) {
      editor.canvas.remove(this._selectionRect);
      this._selectionRect = null;
    }
  },

  getOptionsHTML() {
    return '';
  },
};
