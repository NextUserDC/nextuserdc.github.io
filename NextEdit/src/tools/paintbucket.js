import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';
import * as fabric from 'fabric';

export default {
  name: 'paintbucket',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16l9-9 8 8-4 4"/><path d="M6 11l4 4"/><path d="M19 15l2 2 2-2-2-2-2 2z" fill="currentColor"/></svg>`,
  shortcut: 'g',

  _tolerance: 32,
  _fillColor: '#ff0000',
  _opacity: 100,

  activate() {
    const canvas = editor.canvas;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';

    bus.on('tool:option', this._onOption.bind(this));
  },

  deactivate() {
    const canvas = editor.canvas;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';

    bus.off('tool:option', this._onOption);
  },

  _onOption(opts) {
    if (opts.floodTolerance !== undefined) this._tolerance = Number(opts.floodTolerance);
    if (opts.floodColor !== undefined) this._fillColor = opts.floodColor;
    if (opts.floodOpacity !== undefined) this._opacity = Number(opts.floodOpacity);
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);

    const fillX = Math.floor(pointer.x);
    const fillY = Math.floor(pointer.y);

    const tmpCanvas = canvas.toCanvasElement();
    const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    const data = imgData.data;

    const w = tmpCanvas.width;
    const h = tmpCanvas.height;

    if (fillX < 0 || fillX >= w || fillY < 0 || fillY >= h) return;

    const targetIdx = (fillY * w + fillX) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];

    const r = parseInt(this._fillColor.slice(1, 3), 16);
    const g = parseInt(this._fillColor.slice(3, 5), 16);
    const b = parseInt(this._fillColor.slice(5, 7), 16);
    const fillA = Math.round((this._opacity / 100) * 255);

    if (
      Math.abs(targetR - r) < 2 &&
      Math.abs(targetG - g) < 2 &&
      Math.abs(targetB - b) < 2 &&
      Math.abs(targetA - fillA) < 2
    ) {
      return;
    }

    const tol = this._tolerance;
    const visited = new Uint8Array(w * h);
    const stack = [fillX, fillY];

    function colorMatch(idx) {
      return (
        Math.abs(data[idx] - targetR) <= tol &&
        Math.abs(data[idx + 1] - targetG) <= tol &&
        Math.abs(data[idx + 2] - targetB) <= tol &&
        Math.abs(data[idx + 3] - targetA) <= tol
      );
    }

    while (stack.length > 0) {
      const cy = stack.pop();
      const cx = stack.pop();
      const pixIdx = (cy * w + cx) * 4;

      if (visited[cy * w + cx]) continue;
      if (!colorMatch(pixIdx)) continue;

      visited[cy * w + cx] = 1;

      data[pixIdx] = r;
      data[pixIdx + 1] = g;
      data[pixIdx + 2] = b;
      data[pixIdx + 3] = fillA;

      if (cx > 0 && !visited[cy * w + (cx - 1)]) {
        stack.push(cx - 1, cy);
      }
      if (cx < w - 1 && !visited[cy * w + (cx + 1)]) {
        stack.push(cx + 1, cy);
      }
      if (cy > 0 && !visited[(cy - 1) * w + cx]) {
        stack.push(cx, cy - 1);
      }
      if (cy < h - 1 && !visited[(cy + 1) * w + cx]) {
        stack.push(cx, cy + 1);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    fabric.FabricImage.fromURL(tmpCanvas.toDataURL()).then((img) => {
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      canvas.add(img);
      canvas.renderAll();
      bus.emit('history:push');
    });
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#ccc;">
        <label style="display:flex;align-items:center;gap:6px;">
          Tolerance
          <input type="range" min="0" max="255" value="${this._tolerance}"
            data-tool-opt="floodTolerance"
            style="flex:1;" />
          <span id="pb-tol-val">${this._tolerance}</span>
        </label>
        <label style="display:flex;align-items:center;gap:6px;">
          Color
          <input type="color" value="${this._fillColor}"
            data-tool-opt="floodColor" />
        </label>
        <label style="display:flex;align-items:center;gap:6px;">
          Opacity
          <input type="range" min="0" max="100" value="${this._opacity}"
            data-tool-opt="floodOpacity"
            style="flex:1;" />
          <span id="pb-op-val">${this._opacity}</span>
        </label>
      </div>`;
  },
};
