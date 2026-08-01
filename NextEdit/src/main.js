import './styles/main.css';
import { editor } from './core/editor.js';
import { initUI } from './ui/layout.js';
import { initShortcuts } from './ui/shortcuts.js';
import { initContextMenu } from './ui/contextmenu.js';
import { initDialogs } from './ui/dialogs.js';
import { initFilters } from './filters/index.js';
import { initToast } from './ui/toast.js';
import { initGrid } from './ui/grid.js';
import { initRulers } from './ui/rulers.js';
import { initLanding } from './landing.js';
import { saveProject } from './storage.js';
import { bus } from './core/events.js';

let currentProject = null;
let autoSaveTimer = null;

async function startEditor(project) {
  currentProject = project;
  initUI();
  await editor.init();
  initShortcuts();
  initContextMenu();
  initDialogs();
  initFilters();
  initToast();
  initGrid();
  initRulers();

  if (project.canvasJSON) {
    await editor.loadCanvasJSON(project.canvasJSON);
  } else {
    editor.newDocument(project.width, project.height, project.bgColor || '#ffffff');
  }

  bus.emit('editor:ready');

  autoSaveTimer = setInterval(() => {
    if (currentProject) {
      const json = editor.getCanvasJSON();
      const thumb = editor.canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.15 });
      saveProject({ ...currentProject, canvasJSON: json, thumbnail: thumb });
    }
  }, 15000);

  bus.on('editor:newDocument', ({ width, height }) => {
    if (currentProject) {
      currentProject.width = width;
      currentProject.height = height;
      currentProject.name = `${width} × ${height}`;
    }
  });
}

function goToLanding() {
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  if (currentProject) {
    try {
      const json = editor.getCanvasJSON();
      const thumb = editor.canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.15 });
      saveProject({ ...currentProject, canvasJSON: json, thumbnail: thumb });
    } catch {}
  }
  currentProject = null;
  editor.reset();
  initLanding(startEditor);
}

document.addEventListener('DOMContentLoaded', () => {
  initLanding(startEditor);
});

bus.on('file:close', () => {
  goToLanding();
});
