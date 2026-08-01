import * as fabric from 'fabric';
import { initCanvas, getCanvas, resizeCanvas } from './canvas.js';
import { History } from './history.js';
import { bus } from './events.js';

import moveTool from '../tools/move.js';
import brushTool from '../tools/brush.js';
import eraserTool from '../tools/eraser.js';
import textTool from '../tools/text.js';
import shapesTool from '../tools/shapes.js';
import cropTool from '../tools/crop.js';
import eyedropperTool from '../tools/eyedropper.js';
import zoomTool from '../tools/zoom.js';

import { registerTool, initToolManager } from '../ui/toolbar.js';
import { openFileDialog, handleFileImport } from '../io/import.js';
import { exportPNG, exportJPG, exportWebP } from '../io/export.js';

class Editor {
  constructor() {
    this.canvas = null;
    this.history = null;
    this.currentTool = 'move';
    this.activeObject = null;
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    this.canvas = initCanvas('main-canvas');
    this.history = new History();
    this._clipboard = null;

    registerTool('move', moveTool);
    registerTool('brush', brushTool);
    registerTool('eraser', eraserTool);
    registerTool('text', textTool);
    registerTool('shapes', shapesTool);
    registerTool('crop', cropTool);
    registerTool('eyedropper', eyedropperTool);
    registerTool('zoom', zoomTool);

    initToolManager();

    this._setupCanvasEvents();
    this._setupBusListeners();

    this.setTool('move');
    this.newDocument(1200, 800, '#ffffff');

    this._initialized = true;
    bus.emit('editor:ready');
  }

  _setupCanvasEvents() {
    this.canvas.on('mouse:down', (e) => {
      bus.emit('canvas:mousedown', e);
    });

    this.canvas.on('mouse:move', (e) => {
      const pointer = this.canvas.getScenePoint(e.e);
      bus.emit('canvas:mousemove', { e, x: Math.round(pointer.x), y: Math.round(pointer.y) });
    });

    this.canvas.on('mouse:up', (e) => {
      bus.emit('canvas:mouseup', e);
    });

    this.canvas.on('object:added', () => {
      bus.emit('canvas:object:added');
      if (this.history.total > 0) {
        this.saveState();
      }
    });

    this.canvas.on('object:removed', () => {
      bus.emit('canvas:object:removed');
      if (this.history.total > 0) {
        this.saveState();
      }
    });

    this.canvas.on('object:modified', () => {
      bus.emit('canvas:object:modified');
      this.saveState();
    });

    this.canvas.on('selection:created', (e) => {
      this.activeObject = e.selected?.[0] || null;
      bus.emit('selection:created', { target: this.activeObject });
    });

    this.canvas.on('selection:updated', (e) => {
      this.activeObject = e.selected?.[0] || null;
      bus.emit('selection:updated', { target: this.activeObject });
    });

    this.canvas.on('selection:cleared', () => {
      this.activeObject = null;
      bus.emit('selection:cleared', { target: null });
    });
  }

  _setupBusListeners() {
    bus.on('menu:action', (action) => this.handleMenuAction(action));
    bus.on('file:import', (data) => {
      if (data?.file) handleFileImport(data.file);
    });
    bus.on('tool:changed', (toolName) => {
      this.currentTool = toolName;
    });
    bus.on('history:undo', () => this.undo());
    bus.on('history:redo', () => this.redo());
  }

  setTool(toolName) {
    this.currentTool = toolName;
    bus.emit('tool:select', toolName);
  }

  newDocument(width = 1200, height = 800, bgColor = '#ffffff') {
    this.history.clear();
    this.canvas.clear();
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    this.canvas.backgroundColor = bgColor;
    this.canvas.renderAll();
    bus.emit('editor:newDocument', { width, height, bgColor });
    this.saveState();
  }

  getCanvasJSON() {
    return this.canvas.toJSON([
      'id', 'name', 'selectable', 'evented', 'visible',
      'lockMovementX', 'lockMovementY', 'lockRotation',
      'lockScalingX', 'lockScalingY', 'opacity'
    ]);
  }

  loadCanvasJSON(json) {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(json).then(() => {
        this.canvas.renderAll();
        this.history.clear();
        this.saveState();
        bus.emit('editor:loaded');
        resolve();
      });
    });
  }

  saveState() {
    const state = this.getCanvasJSON();
    this.history.push(state);
  }

  undo() {
    const state = this.history.undo();
    if (state) {
      this.canvas.loadFromJSON(state).then(() => {
        this.canvas.renderAll();
        bus.emit('editor:undo');
      });
    }
  }

  redo() {
    const state = this.history.redo();
    if (state) {
      this.canvas.loadFromJSON(state).then(() => {
        this.canvas.renderAll();
        bus.emit('editor:redo');
      });
    }
  }

  handleMenuAction(action) {
    switch (action) {
      case 'file:new':
      case 'file:open':
        openFileDialog();
        break;
      case 'file:save-png':
        exportPNG();
        break;
      case 'file:save-jpg':
        exportJPG();
        break;
      case 'file:save-webp':
        exportWebP();
        break;
      case 'edit:undo':
        this.undo();
        break;
      case 'edit:redo':
        this.redo();
        break;
      case 'edit:select-all': {
        this.canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
          canvas: this.canvas
        });
        this.canvas.setActiveObject(sel);
        this.canvas.renderAll();
        break;
      }
      case 'edit:copy': {
        const active = this.canvas.getActiveObject();
        if (active) {
          active.clone().then((cloned) => {
            this._clipboard = cloned;
          });
        }
        break;
      }
      case 'edit:paste': {
        if (this._clipboard) {
          this._clipboard.clone().then((cloned) => {
            this.canvas.discardActiveObject();
            cloned.set({
              left: (cloned.left || 0) + 10,
              top: (cloned.top || 0) + 10,
              evented: true
            });
            if (cloned.type === 'activeSelection') {
              cloned.canvas = this.canvas;
              cloned.forEachObject((obj) => {
                this.canvas.add(obj);
              });
              cloned.setCoords();
            } else {
              this.canvas.add(cloned);
            }
            this._clipboard.top += 10;
            this._clipboard.left += 10;
            this.canvas.setActiveObject(cloned);
            this.canvas.renderAll();
          });
        }
        break;
      }
      case 'edit:delete': {
        const active = this.canvas.getActiveObjects();
        if (active.length) {
          active.forEach((obj) => this.canvas.remove(obj));
          this.canvas.discardActiveObject();
          this.canvas.renderAll();
        }
        break;
      }
      case 'view:zoom-in': {
        const center = this.canvas.getCenterPoint();
        let zoom = this.canvas.getZoom() * 1.25;
        zoom = Math.min(Math.max(zoom, 0.1), 10);
        this.canvas.zoomToPoint(center, zoom);
        this.canvas.requestRenderAll();
        bus.emit('zoom:change', { zoom });
        break;
      }
      case 'view:zoom-out': {
        const center = this.canvas.getCenterPoint();
        let zoom = this.canvas.getZoom() * 0.8;
        zoom = Math.min(Math.max(zoom, 0.1), 10);
        this.canvas.zoomToPoint(center, zoom);
        this.canvas.requestRenderAll();
        bus.emit('zoom:change', { zoom });
        break;
      }
      case 'view:fit': {
        const vpt = this.canvas.viewportTransform;
        vpt[4] = 0;
        vpt[5] = 0;
        this.canvas.setViewportTransform(vpt);
        this.canvas.requestRenderAll();
        bus.emit('zoom:change', { zoom: 1 });
        break;
      }
      case 'view:100': {
        const center = this.canvas.getCenterPoint();
        this.canvas.zoomToPoint(center, 1);
        this.canvas.requestRenderAll();
        bus.emit('zoom:change', { zoom: 1 });
        break;
      }
      case 'image:rotate-cw': {
        const active = this.canvas.getActiveObject();
        if (active) {
          active.rotate((active.angle || 0) + 90);
          this.canvas.renderAll();
          this.saveState();
        }
        break;
      }
      case 'image:rotate-ccw': {
        const active = this.canvas.getActiveObject();
        if (active) {
          active.rotate((active.angle || 0) - 90);
          this.canvas.renderAll();
          this.saveState();
        }
        break;
      }
      case 'image:flip-h': {
        const active = this.canvas.getActiveObject();
        if (active) {
          active.set('flipX', !active.flipX);
          this.canvas.renderAll();
          this.saveState();
        }
        break;
      }
      case 'image:flip-v': {
        const active = this.canvas.getActiveObject();
        if (active) {
          active.set('flipY', !active.flipY);
          this.canvas.renderAll();
          this.saveState();
        }
        break;
      }
      case 'image:canvas-size':
        bus.emit('dialog:canvas-size', {
          width: this.canvas.getWidth(),
          height: this.canvas.getHeight()
        });
        break;
      case 'layer:merge-down': {
        const active = this.canvas.getActiveObject();
        if (active) {
          const objects = this.canvas.getObjects();
          const idx = objects.indexOf(active);
          if (idx > 0) {
            const below = objects[idx - 1];
            const group = new fabric.Group([below, active]);
            this.canvas.remove(below);
            this.canvas.remove(active);
            this.canvas.add(group);
            this.canvas.setActiveObject(group);
            this.canvas.renderAll();
            this.saveState();
          }
        }
        break;
      }
      case 'layer:flatten': {
        const dataURL = this.canvas.toDataURL({ format: 'png' });
        const img = new Image();
        img.onload = () => {
          this.canvas.clear();
          const fabricImg = new fabric.FabricImage(img, {
            selectable: false,
            evented: false
          });
          this.canvas.add(fabricImg);
          this.canvas.renderAll();
          this.saveState();
        };
        img.src = dataURL;
        break;
      }
      default:
        break;
    }
  }
}

export const editor = new Editor();
