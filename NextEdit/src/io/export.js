import { editor } from '../core/editor.js';
import { bus } from '../core/events.js';

let docName = 'documento';

function triggerDownload(dataURL, filename) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getDataURL(canvas, format, quality) {
  const options = { format, multiplier: 1 };
  if (quality !== undefined) options.quality = quality;
  return canvas.toDataURL(options);
}

function getBlob(canvas, format, quality) {
  return new Promise((resolve) => {
    const options = { format };
    if (quality !== undefined) options.quality = quality;
    canvas.toBlob((blob) => resolve(blob), format, quality);
  });
}

export function exportPNG(canvas) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'png');
  triggerDownload(dataURL, `${docName}.png`);
  bus.emit('file:exported', { format: 'png' });
}

export function exportJPG(canvas, quality = 0.92) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'jpeg', quality);
  triggerDownload(dataURL, `${docName}.jpg`);
  bus.emit('file:exported', { format: 'jpg' });
}

export function exportWebP(canvas, quality = 0.92) {
  canvas = canvas || editor.canvas;
  const dataURL = getDataURL(canvas, 'webp', quality);
  triggerDownload(dataURL, `${docName}.webp`);
  bus.emit('file:exported', { format: 'webp' });
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
  }
});

bus.on('editor:newDocument', (data) => {
  if (data.name) docName = data.name;
});

bus.on('file:rename', (data) => {
  if (data.name) docName = data.name;
});
