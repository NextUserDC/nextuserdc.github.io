import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

let docName = 'documento';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getDataURL(canvas, format, quality) {
  const options = { format, multiplier: 1 };
  if (quality !== undefined) options.quality = quality;
  return canvas.toDataURL(options);
}

export function exportPNG(canvas) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'png');
  const blob = dataURLToBlob(dataURL);
  downloadBlob(blob, `${docName}.png`);
  bus.emit('file:exported', { format: 'png' });
}

export function exportJPG(canvas, quality = 0.92) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'jpeg', quality);
  const blob = dataURLToBlob(dataURL);
  downloadBlob(blob, `${docName}.jpg`);
  bus.emit('file:exported', { format: 'jpg' });
}

export function exportWebP(canvas, quality = 0.92) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'webp', quality);
  const blob = dataURLToBlob(dataURL);
  downloadBlob(blob, `${docName}.webp`);
  bus.emit('file:exported', { format: 'webp' });
}

export function exportSVG(canvas) {
  canvas = canvas || editor.canvas;
  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, `${docName}.svg`);
  bus.emit('file:exported', { format: 'svg' });
}

async function copyToClipboard() {
  const canvas = editor.canvas;
  const dataURL = canvas.toDataURL({ format: 'png', multiplier: 1 });
  const response = await fetch(dataURL);
  const blob = await response.blob();
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
  bus.emit('file:copied', { format: 'clipboard' });
}

function dataURLToBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

bus.on('menu:action', (action) => {
  switch (action) {
    case 'file:save-png':
      exportPNG();
      break;
    case 'file:save-jpg':
      exportJPG();
      break;
    case 'file:save-webp':
      exportWebP();
      break;
    case 'file:save-svg':
      exportSVG();
      break;
    case 'file:copy-clipboard':
      copyToClipboard();
      break;
  }
});

bus.on('editor:newDocument', (data) => {
  if (data.name) docName = data.name;
});

bus.on('file:rename', (data) => {
  if (data.name) docName = data.name;
});
