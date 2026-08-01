import './styles/main.css';
import { editor } from './core/editor.js';
import { initUI } from './ui/layout.js';
import { initShortcuts } from './ui/shortcuts.js';
import { bus } from './core/events.js';

async function init() {
  initUI();
  await editor.init();
  initShortcuts();
  bus.emit('app:ready');
}

document.addEventListener('DOMContentLoaded', init);
