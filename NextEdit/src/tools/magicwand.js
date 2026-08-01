import * as fabric from 'fabric';
import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

let tolerance = 30;

function getPixelColor(ctx, x, y) {
  const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return [pixel[0], pixel[1], pixel[2], pixel[3]];
}

function colorDistance(a, b) {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2], da = a[3] - b[3];
  return Math.sqrt(dr * dr + dg * dg + db * db + da * da);
}

function floodFill(ctx, startX, startY, w, h, targetColor, tol) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const visited = new Uint8Array(w * h);
  const stack = [[Math.floor(startX), Math.floor(startY)]];
  let minX = w, maxX = 0, minY = h, maxY = 0, pixelCount = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;

    const offset = idx * 4;
    const c = [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    if (colorDistance(c, targetColor) > tol) continue;

    visited[idx] = 1;
    pixelCount++;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return { visited, minX, maxX, minY, maxY, pixelCount };
}

function findObjectsInRegion(region) {
  const objects = editor.canvas.getObjects().filter(o => !o.excludeFromExport && o.selectable);
  return objects.filter(obj => {
    const b = obj.getBoundingRect();
    return region.minX < b.left + b.width && region.maxX > b.left &&
           region.minY < b.top + b.height && region.maxY > b.top;
  });
}

export default {
  name: 'magicwand',
  icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18L10 10M10 2l1.5 3.5L15 7l-3.5 1.5L10 12l-1.5-3.5L5 7l3.5-1.5L10 2z"/><path d="M15 14l.7 1.5L17 16.2l-1.3.7L15 18.5l-.7-1.6L13 16.2l1.3-.7z"/></svg>`,
  shortcut: 'w',

  activate() {
    editor.canvas.selection = false;
    editor.canvas.setCursor('crosshair');
  },

  deactivate() {
    editor.canvas.setCursor('default');
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);
    const canvasEl = canvas.lowerCanvasEl;
    const ctx = canvasEl.getContext('2d');
    const w = canvasEl.width, h = canvasEl.height;

    const targetColor = getPixelColor(ctx, pointer.x, pointer.y);
    const region = floodFill(ctx, pointer.x, pointer.y, w, h, targetColor, tolerance);

    if (region.pixelCount < 2) {
      canvas.discardActiveObject(); canvas.renderAll(); return;
    }

    const hits = findObjectsInRegion(region);
    if (hits.length > 0) {
      canvas.setActiveObject(new fabric.ActiveSelection(hits, { canvas }));
    } else {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div class="optionsbar__group">
        <span class="optionsbar__label">Tolerancia</span>
        <input type="range" class="optionsbar__input" data-option="wandTolerance" min="0" max="128" value="${tolerance}" style="width:100px">
        <input type="number" class="optionsbar__input" data-option="wandTolerance-num" min="0" max="128" value="${tolerance}" style="width:48px">
      </div>
    `;
  }
};

bus.on('tool:option', (data) => {
  if (data.key === 'wandTolerance') tolerance = parseInt(data.value, 10) || 30;
});
