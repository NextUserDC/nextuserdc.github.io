import * as fabric from 'fabric';
import { bus } from './events.js';

let canvas = null;
let container = null;
let spacePressed = false;
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;

function setupMouseWheelZoom(fabricCanvas) {
  fabricCanvas.on('mouse:wheel', (opt) => {
    const e = opt.e;
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;
    let zoom = fabricCanvas.getZoom();
    zoom *= 0.999 ** delta;
    zoom = Math.min(Math.max(0.1, zoom), 10);

    const pointer = fabricCanvas.getScenePoint(e);
    fabricCanvas.zoomToPoint({ x: pointer.x, y: pointer.y }, zoom);
    fabricCanvas.requestRenderAll();
    bus.emit('zoom:change', { zoom });
  });
}

function setupPanning(fabricCanvas) {
  fabricCanvas.on('mouse:down', (opt) => {
    const e = opt.e;
    if (e.button === 1 || (spacePressed && e.button === 0)) {
      isPanning = true;
      fabricCanvas.selection = false;
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      fabricCanvas.setCursor('grabbing');
    }
  });

  fabricCanvas.on('mouse:move', (opt) => {
    if (!isPanning) return;
    const e = opt.e;
    const vpt = fabricCanvas.viewportTransform;
    vpt[4] += e.clientX - lastPanX;
    vpt[5] += e.clientY - lastPanY;
    lastPanX = e.clientX;
    lastPanY = e.clientY;
    fabricCanvas.requestRenderAll();
  });

  fabricCanvas.on('mouse:up', (opt) => {
    if (isPanning) {
      isPanning = false;
      fabricCanvas.selection = true;
      fabricCanvas.setCursor('default');
    }
  });
}

function setupKeyboardListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      spacePressed = true;
      if (canvas) canvas.setCursor('grab');
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      spacePressed = false;
      if (canvas) canvas.setCursor('default');
    }
  });
}

function setupResizeObserver() {
  if (!container) return;

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  resizeObserver.observe(container);
}

export function initCanvas(canvasElId) {
  const canvasEl = document.getElementById(canvasElId);
  if (!canvasEl) {
    throw new Error(`Canvas element #${canvasElId} not found`);
  }

  container = canvasEl.parentElement;

  canvas = new fabric.Canvas(canvasEl, {
    selection: true,
    preserveObjectStacking: true,
    stopContextMenu: true,
    fireRightClick: true,
    backgroundColor: '#ffffff',
    controlsAboveOverlay: true
  });

  fabric.Object.prototype.set({
    fill: '#000000',
    stroke: '',
    strokeWidth: 0,
    transparentCorners: false,
    cornerColor: '#0078d4',
    cornerStrokeColor: '#0078d4',
    borderColor: '#0078d4',
    cornerSize: 10,
    cornerStyle: 'circle',
    borderScaleFactor: 1.5,
    padding: 5
  });

  setupMouseWheelZoom(canvas);
  setupPanning(canvas);
  setupKeyboardListeners();
  resizeCanvas();
  setupResizeObserver();

  bus.emit('canvas:ready', canvas);

  return canvas;
}

export function resizeCanvas() {
  if (!canvas || !container) return;

  const rect = container.getBoundingClientRect();
  canvas.setDimensions({
    width: rect.width,
    height: rect.height
  });
  canvas.renderAll();
}

export function getCanvas() {
  return canvas;
}
