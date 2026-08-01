import './styles/main.css';
import { editor } from './core/editor.js';
import { initUI } from './ui/layout.js';
import { initShortcuts } from './ui/shortcuts.js';
import { initContextMenu } from './ui/contextmenu.js';
import { initDialogs } from './ui/dialogs.js';
import { initFilters } from './filters/index.js';
import { bus } from './core/events.js';

async function init() {
  initUI();
  await editor.init();
  initShortcuts();
  initContextMenu();
  initDialogs();
  initFilters();
  bus.emit('app:ready');
}

document.addEventListener('DOMContentLoaded', init);
