import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let fileInput = null;

function getFileInput() {
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/webp,image/bmp,image/gif,image/svg+xml';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFileImport(file);
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

export async function handleFileImport(file) {
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

    group.set({
      left: (canvas.getWidth() - group.width * scale) / 2,
      top: (canvas.getHeight() - group.height * scale) / 2,
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

    fabricImg.set({
      left: (canvas.getWidth() - img.width * scale) / 2,
      top: (canvas.getHeight() - img.height * scale) / 2,
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

bus.on('file:import', openFileDialog);
