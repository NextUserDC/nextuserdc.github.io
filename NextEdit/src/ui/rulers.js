import { bus } from '../core/events.js';
import { editor } from '../core/editor.js';

let rulerH = null;
let rulerV = null;
let visible = false;

export function initRulers() {
  bus.on('menu:action', (action) => {
    if (action === 'view:rulers') toggleRulers();
  });
}

function toggleRulers() {
  visible = !visible;
  
  if (visible) {
    createRulers();
    bus.emit('toast:show', { message: 'Reglas visibles', type: 'info' });
  } else {
    removeRulers();
    bus.emit('toast:show', { message: 'Reglas ocultas', type: 'info' });
  }
}

function createRulers() {
  const canvasArea = document.getElementById('canvas-area');
  if (!canvasArea) return;
  
  // Horizontal ruler
  rulerH = document.createElement('div');
  rulerH.className = 'canvas-area__ruler-h';
  rulerH.style.cssText = `
    position:absolute;top:0;left:24px;right:0;height:24px;
    background:#1a1a2e;border-bottom:1px solid #333;z-index:10;
    overflow:hidden;
  `;
  canvasArea.appendChild(rulerH);
  
  // Vertical ruler
  rulerV = document.createElement('div');
  rulerV.className = 'canvas-area__ruler-v';
  rulerV.style.cssText = `
    position:absolute;top:24px;left:0;bottom:0;width:24px;
    background:#1a1a2e;border-right:1px solid #333;z-index:10;
    overflow:hidden;
  `;
  canvasArea.appendChild(rulerV);
  
  drawRulers();
  
  bus.on('zoom:change', drawRulers);
  bus.on('canvas:mousemove', updateGuides);
}

function drawRulers() {
  if (!visible || !rulerH || !rulerV) return;
  
  const zoom = editor.canvas.getZoom();
  const vpt = editor.canvas.viewportTransform;
  const canvasW = editor.canvas.getWidth();
  const canvasH = editor.canvas.getHeight();
  
  // Horizontal ruler ticks
  let hTicks = '';
  const step = calculateTickStep(zoom);
  for (let x = 0; x <= canvasW; x += step) {
    const px = x * zoom + vpt[4];
    const isMajor = x % (step * 5) === 0;
    const tickH = isMajor ? 12 : 6;
    hTicks += `<div style="position:absolute;left:${px}px;top:${24 - tickH}px;width:1px;height:${tickH}px;background:rgba(255,255,255,0.4)"></div>`;
    if (isMajor) {
      hTicks += `<div style="position:absolute;left:${px + 2}px;top:2px;font-size:9px;color:rgba(255,255,255,0.5);font-family:monospace">${x}</div>`;
    }
  }
  rulerH.innerHTML = hTicks;
  
  // Vertical ruler ticks
  let vTicks = '';
  for (let y = 0; y <= canvasH; y += step) {
    const py = y * zoom + vpt[5];
    const isMajor = y % (step * 5) === 0;
    const tickW = isMajor ? 12 : 6;
    vTicks += `<div style="position:absolute;top:${py}px;left:${24 - tickW}px;width:${tickW}px;height:1px;background:rgba(255,255,255,0.4)"></div>`;
    if (isMajor) {
      vTicks += `<div style="position:absolute;top:${py + 2}px;left:2px;font-size:9px;color:rgba(255,255,255,0.5);font-family:monospace;writing-mode:vertical-rl;transform:rotate(180deg)">${y}</div>`;
    }
  }
  rulerV.innerHTML = vTicks;
}

function calculateTickStep(zoom) {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  for (const step of steps) {
    if (step * zoom >= 10) return step;
  }
  return 1000;
}

function updateGuides() {
  if (!visible) return;
  drawRulers();
}

function removeRulers() {
  rulerH?.remove();
  rulerV?.remove();
  rulerH = null;
  rulerV = null;
}
