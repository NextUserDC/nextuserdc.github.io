import { bus } from '../core/events.js';

function buildShortcutKey(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  let key = e.key.toLowerCase();
  if (key === ' ') key = 'space';
  else if (key === 'delete') key = 'delete';
  else if (key === 'backspace') key = 'backspace';
  else if (key === 'escape') key = 'escape';
  else if (key === 'arrowup') key = 'arrowup';
  else if (key === 'arrowdown') key = 'arrowdown';
  else if (key === 'arrowleft') key = 'arrowleft';
  else if (key === 'arrowright') key = 'arrowright';

  if (!['ctrl', 'shift', 'alt', 'meta', 'control'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

const shortcuts = {
  'ctrl+z': 'edit:undo',
  'ctrl+shift+z': 'edit:redo',
  'ctrl+y': 'edit:redo',
  'ctrl+c': 'edit:copy',
  'ctrl+v': 'edit:paste',
  'ctrl+a': 'edit:select-all',
  'delete': 'edit:delete',
  'backspace': 'edit:delete',
  'ctrl+n': 'file:new',
  'ctrl+o': 'file:open',
  'ctrl+s': 'file:save-png',
  'ctrl+shift+s': 'file:save-png',
  'ctrl+=': 'view:zoom-in',
  'ctrl+-': 'view:zoom-out',
  'ctrl+0': 'view:fit',
  'ctrl+1': 'view:100',
  'ctrl+alt+i': 'image:canvas-size',
  'ctrl+alt+c': 'image:canvas-size',
  'v': 'tool:move',
  'b': 'tool:brush',
  'e': 'tool:eraser',
  't': 'tool:text',
  'u': 'tool:shapes',
  'c': 'tool:crop',
  'i': 'tool:eyedropper',
  'z': 'tool:zoom',
  'm': 'tool:marquee',
  'g': 'tool:paintbucket'
};

function isFabricTextarea(el) {
  if (!el) return false;
  if (el.getAttribute && (el.getAttribute('data-fabric') === 'textarea' || el.getAttribute('name') === 'fabricTextarea')) return true;
  if (el.classList && el.classList.contains('upper-canvas')) return true;
  return false;
}

function isRealInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  if (isFabricTextarea(el)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const inFabric = isFabricTextarea(document.activeElement);
    const inInput = isRealInputFocused();
    if (inInput) return;

    const key = buildShortcutKey(e);
    const action = shortcuts[key];

    if (action) {
      if (inFabric && !key.startsWith('ctrl')) return;

      e.preventDefault();
      e.stopPropagation();

      if (action.startsWith('tool:')) {
        bus.emit('tool:select', action.replace('tool:', ''));
      } else {
        bus.emit('menu:action', action);
      }
    }
  });
}
