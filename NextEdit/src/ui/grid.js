import { bus } from '../core/events.js';
import { editor } from '../core/editor.js';

let gridVisible = false;
let gridSize = 20;
let gridOverlay = null;
let snapEnabled = true;

export function initGrid() {
  bus.on('menu:action', (action) => {
    if (action === 'view:grid') toggleGrid();
  });
  
  bus.on('canvas:mousemove', (pos) => {
    if (snapEnabled && gridVisible) {
      
      
    }
  });
}

function toggleGrid() {
  gridVisible = !gridVisible;
  const canvas = editor.canvas;
  
  if (gridVisible) {
    drawGrid(canvas);
    bus.emit('toast:show', { message: `Cuadrícula visible (${gridSize}px)`, type: 'info' });
  } else {
    removeGrid();
    bus.emit('toast:show', { message: 'Cuadrícula oculta', type: 'info' });
  }
}

function drawGrid(canvas) {
  removeGrid();
  const ctx = canvas.getContext('2d');
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform;
  
  
  const gridSizeScaled = gridSize * zoom;
  const offsetX = (vpt[4] % gridSizeScaled);
  const offsetY = (vpt[5] % gridSizeScaled);
  
  gridOverlay = new fabric.Rect({
    left: 0, top: 0, width: width * 2, height: height * 2,
    fill: 'transparent',
    stroke: 'rgba(255,255,255,0.12)',
    strokeWidth: 1,
    strokeDashArray: [gridSizeScaled, gridSizeScaled],
    selectable: false, evented: false,
    excludeFromExport: true,
    name: '__grid__'
  });
  
  canvas.add(gridOverlay);
  canvas.sendObjectBackwards(gridOverlay);
  canvas.renderAll();
}

function removeGrid() {
  const canvas = editor.canvas;
  if (gridOverlay) {
    canvas.remove(gridOverlay);
    gridOverlay = null;
    canvas.renderAll();
  }
}

export function snapToGrid(x, y) {
  if (!gridVisible || !snapEnabled) return { x, y };
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

export function isGridVisible() { return gridVisible; }
