import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let fileInput = null;
let importOffset = 0;

function getFileInput() {
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/webp,image/bmp,image/gif,image/svg+xml';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        if (files.length === 1) {
          handleFileImport(files[0]);
        } else {
          handleMultipleFileImport(files);
        }
      }
      fileInput.value = '';
    });
    document.body.appendChild(fileInput);
  }
  return fileInput;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function openFileDialog() {
  getFileInput().click();
}

export async function handleFileImport(file, options = {}) {
  if (!file) return;

  const isSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (isSVG) {
    const text = await file.text();
    const objects = await fabric.loadSVGFromString(text);
    const group = fabric.util.groupSVGElements(objects.objects, objects.options);

    const canvas = editor.canvas;
    const maxWidth = canvas.getWidth() * 0.8;
    const maxHeight = canvas.getHeight() * 0.8;
    let scale = 1;

    if (group.width > maxWidth || group.height > maxHeight) {
      scale = Math.min(maxWidth / group.width, maxHeight / group.height);
    }

    const centerX = options.left ?? (canvas.getWidth() - group.width * scale) / 2;
    const centerY = options.top ?? (canvas.getHeight() - group.height * scale) / 2;

    group.set({
      left: centerX,
      top: centerY,
      scaleX: scale,
      scaleY: scale
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    bus.emit('file:imported', { type: 'svg', object: group });
    return;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const fabricImg = new fabric.FabricImage(img, {
      selectable: true,
      evented: true
    });

    const canvas = editor.canvas;
    const maxWidth = canvas.getWidth() * 0.8;
    const maxHeight = canvas.getHeight() * 0.8;
    let scale = 1;

    if (img.width > maxWidth || img.height > maxHeight) {
      scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    }

    const centerX = options.left ?? (canvas.getWidth() - img.width * scale) / 2;
    const centerY = options.top ?? (canvas.getHeight() - img.height * scale) / 2;

    fabricImg.set({
      left: centerX,
      top: centerY,
      scaleX: scale,
      scaleY: scale
    });

    canvas.add(fabricImg);
    canvas.setActiveObject(fabricImg);
    canvas.renderAll();
    bus.emit('file:imported', { type: file.type, object: fabricImg });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function handleMultipleFileImport(files) {
  const canvas = editor.canvas;
  importOffset = 0;

  files.forEach((file, index) => {
    const offsetX = 20 * (index % 5);
    const offsetY = 20 * Math.floor(index / 5);

    handleFileImport(file, {
      left: (canvas.getWidth() - canvas.getWidth() * 0.8) / 2 + offsetX,
      top: (canvas.getHeight() - canvas.getHeight() * 0.8) / 2 + offsetY
    });
  });
}

async function importFromURL(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = url.split('.').pop().toLowerCase();
    const mimeMap = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'gif': 'image/gif',
      'svg': 'image/svg+xml'
    };
    const mime = mimeMap[ext] || blob.type || 'image/png';
    const filename = url.split('/').pop() || `imagen.${ext || 'png'}`;
    const file = new File([blob], filename, { type: mime });
    handleFileImport(file);
  } catch (err) {
    console.error('Error al importar desde URL:', err);
  }
}

document.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      handleFileImport(blob);
      e.preventDefault();
      break;
    }
  }
});

bus.on('menu:action', (action) => {
  if (action === 'file:open-url') {
    const url = prompt('URL de la imagen:');
    if (url) importFromURL(url);
  }
});

bus.on('file:import', openFileDialog);
