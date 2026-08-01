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
import { bus } from './core/events.js';

async function init() {
  initUI();
  await editor.init();
  initShortcuts();
  initContextMenu();
  initDialogs();
  initFilters();
  initToast();
  initGrid();
  initRulers();
  bus.emit('app:ready');
}

document.addEventListener('DOMContentLoaded', init);
