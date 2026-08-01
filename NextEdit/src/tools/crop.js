import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let cropRect = null;
let aspectRatio = null;

function getCanvasBounds() {
  const canvas = editor.canvas;
  return {
    width: canvas.getWidth(),
    height: canvas.getHeight()
  };
}

function createCropOverlay() {
  const canvas = editor.canvas;
  const { width, height } = getCanvasBounds();

  const padding = 40;
  cropRect = new fabric.Rect({
    left: padding,
    top: padding,
    width: width - padding * 2,
    height: height - padding * 2,
    fill: 'rgba(0,0,0,0.3)',
    stroke: '#ffffff',
    strokeWidth: 2,
    strokeDashArray: [8, 4],
    cornerColor: '#ffffff',
    cornerStrokeColor: '#000000',
    cornerSize: 12,
    cornerStyle: 'circle',
    borderColor: '#ffffff',
    transparentCorners: false,
    hasRotatingPoint: false,
    lockRotation: true,
    excludeFromExport: true,
    _isCropOverlay: true
  });

  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  canvas.renderAll();
}

function removeCropOverlay() {
  const canvas = editor.canvas;
  if (cropRect) {
    canvas.remove(cropRect);
    cropRect = null;
    canvas.renderAll();
  }
}

function applyCrop() {
  if (!cropRect) return;
  const canvas = editor.canvas;

  const cropLeft = cropRect.left;
  const cropTop = cropRect.top;
  const cropWidth = cropRect.width * cropRect.scaleX;
  const cropHeight = cropRect.height * cropRect.scaleY;

  removeCropOverlay();

  const dataURL = canvas.toDataURL({
    format: 'png',
    left: cropLeft,
    top: cropTop,
    width: cropWidth,
    height: cropHeight
  });

  canvas.loadFromJSON(canvas.toJSON()).then(() => {
    const img = new Image();
    img.onload = () => {
      canvas.clear();
      canvas.setWidth(cropWidth);
      canvas.setHeight(cropHeight);

      const fabricImg = new fabric.FabricImage(img, {
        selectable: false,
        evented: false
      });
      canvas.add(fabricImg);
      canvas.renderAll();
      bus.emit('editor:cropped', { width: cropWidth, height: cropHeight });
    };
    img.src = dataURL;
  });
}

export default {
  name: 'crop',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2v13h13M2 5h13v13"/></svg>`,
  shortcut: 'c',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
    canvas.setCursor('default');
    createCropOverlay();
  },

  deactivate() {
    removeCropOverlay();
    const canvas = editor.canvas;
    canvas.setCursor('default');
  },

  onMouseDown() {},
  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    return `
      <div class="tool-options-group">
        <label>Proporción</label>
        <select id="crop-ratio">
          <option value="free" selected>Libre</option>
          <option value="1:1">1:1</option>
          <option value="4:3">4:3</option>
          <option value="16:9">16:9</option>
          <option value="3:2">3:2</option>
        </select>
      </div>
      <div class="tool-options-group">
        <button id="crop-apply" class="tool-btn">Aplicar</button>
        <button id="crop-cancel" class="tool-btn">Cancelar</button>
      </div>
    `;
  }
};

bus.on('tool:optionsBind', (data) => {
  if (data.tool !== 'crop') return;

  const ratioSelect = document.getElementById('crop-ratio');
  const applyBtn = document.getElementById('crop-apply');
  const cancelBtn = document.getElementById('crop-cancel');

  if (ratioSelect) {
    ratioSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'free') {
        aspectRatio = null;
        if (cropRect) {
          cropRect.lockScalingX = false;
          cropRect.lockScalingY = false;
        }
      } else {
        const [w, h] = val.split(':').map(Number);
        aspectRatio = w / h;
        if (cropRect) {
          cropRect.lockScalingX = false;
          cropRect.lockScalingY = false;
        }
      }
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', applyCrop);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      removeCropOverlay();
      bus.emit('tool:deactivate');
    });
  }
});

bus.on('crop:apply', applyCrop);
bus.on('crop:cancel', removeCropOverlay);
