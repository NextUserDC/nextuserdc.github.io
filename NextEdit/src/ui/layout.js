import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { initLayersPanel } from './panels/layers.js';
import { initColorPanel } from './panels/color.js';
import { initPropertiesPanel } from './panels/properties.js';
import { initBlendingPanel } from './panels/blending.js';

export function initUI() {
  const app = $('app');
  app.innerHTML = `
    <div class="menubar" id="menubar"></div>
    <div class="toolbar" id="toolbar"></div>
    <div class="optionsbar" id="optionsbar"></div>
    <div class="canvas-area" id="canvas-area">
      <canvas id="main-canvas"></canvas>
      <div class="canvas-area__dropzone" id="dropzone">
        <div class="canvas-area__dropzone-text">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p>Arrastra una imagen aquí</p>
          <span>o haz clic en Archivo → Abrir</span>
        </div>
      </div>
    </div>
    <div class="panel" id="panel"></div>
    <div class="statusbar" id="statusbar"></div>
  `;

  initMenubar();
  initToolbar();
  initOptionsBar();
  initPanel();
  initStatusbar();
  initDropzone();
}

function initMenubar() {
  const menubar = $('menubar');

  const menus = [
    {
      label: 'Archivo',
      items: [
        { action: 'file:new', label: 'Nuevo', shortcut: 'Ctrl+N' },
        { action: 'file:open', label: 'Abrir', shortcut: 'Ctrl+O' },
        { action: 'file:save-png', label: 'Guardar PNG', shortcut: 'Ctrl+Shift+S' },
        { action: 'file:save-jpg', label: 'Guardar JPG' },
        { action: 'file:save-webp', label: 'Guardar WebP' },
        { action: 'file:save-svg', label: 'Guardar SVG' },
        { action: 'file:copy-clipboard', label: 'Copiar al portapapeles' },
        { separator: true },
        { action: 'file:open-url', label: 'Abrir desde URL' },
        { action: 'file:close', label: 'Cerrar' }
      ]
    },
    {
      label: 'Edición',
      items: [
        { action: 'edit:undo', label: 'Deshacer', shortcut: 'Ctrl+Z' },
        { action: 'edit:redo', label: 'Rehacer', shortcut: 'Ctrl+Shift+Z' },
        { separator: true },
        { action: 'edit:copy', label: 'Copiar', shortcut: 'Ctrl+C' },
        { action: 'edit:paste', label: 'Pegar', shortcut: 'Ctrl+V' },
        { action: 'edit:delete', label: 'Eliminar', shortcut: 'Del' },
        { separator: true },
        { action: 'edit:select-all', label: 'Seleccionar Todo', shortcut: 'Ctrl+A' },
        { separator: true },
        { action: 'edit:group', label: 'Agrupar', shortcut: 'Ctrl+G' },
        { action: 'edit:ungroup', label: 'Desagrupar', shortcut: 'Ctrl+Shift+G' },
        { action: 'edit:free-transform', label: 'Transformación libre', shortcut: 'Ctrl+T' }
      ]
    },
    {
      label: 'Imagen',
      items: [
        { action: 'image:canvas-size', label: 'Tamaño de imagen', shortcut: 'Ctrl+Alt+I' },
        { action: 'image:crop', label: 'Lienzo', shortcut: 'Ctrl+Alt+C' },
        { action: 'image:rotate-cw', label: 'Rotar 90° CW' },
        { action: 'image:rotate-ccw', label: 'Rotar 90° CCW' },
        { action: 'image:flip-h', label: 'Voltear horizontal' },
        { action: 'image:flip-v', label: 'Voltear vertical' }
      ]
    },
    {
      label: 'Capa',
      items: [
        { action: 'layer:new', label: 'Nueva capa' },
        { action: 'layer:duplicate', label: 'Duplicar capa' },
        { action: 'layer:delete', label: 'Eliminar capa' },
        { separator: true },
        { action: 'layer:merge-down', label: 'Fusionar hacia abajo' },
        { action: 'layer:flatten', label: 'Aplanar imagen' },
        { separator: true },
        { action: 'layer:merge-visible', label: 'Fusionar visibles', shortcut: 'Ctrl+E' }
      ]
    },
    {
      label: 'Filtro',
      items: [
        { action: 'filter:brightness', label: 'Brillo' },
        { action: 'filter:contrast', label: 'Contraste' },
        { action: 'filter:saturation', label: 'Saturación' },
        { action: 'filter:blur', label: 'Desenfoque' },
        { action: 'filter:hue-rotation', label: 'Rotación de color' },
        { action: 'filter:noise', label: 'Ruido' },
        { action: 'filter:pixelate', label: 'Pixelar' },
        { separator: true },
        { action: 'filter:grayscale', label: 'Escala de grises' },
        { action: 'filter:invert', label: 'Invertir colores' }
      ]
    },
    {
      label: 'Ver',
      items: [
        { action: 'view:zoom-in', label: 'Zoom en', shortcut: 'Ctrl+=' },
        { action: 'view:zoom-out', label: 'Zoom out', shortcut: 'Ctrl+-' },
        { action: 'view:fit', label: 'Ajustar', shortcut: 'Ctrl+0' },
        { action: 'view:100', label: '100%', shortcut: 'Ctrl+1' },
        { separator: true },
        { action: 'view:rulers', label: 'Reglas' },
        { action: 'view:grid', label: 'Cuadrícula' }
      ]
    },
    {
      label: 'Ayuda',
      items: [
        { action: 'help:shortcuts', label: 'Atajos de teclado' },
        { action: 'help:about', label: 'Acerca de NextEdit' }
      ]
    }
  ];

  let activeMenu = null;

  menus.forEach((menu) => {
    const item = document.createElement('div');
    item.className = 'menubar__item';
    item.textContent = menu.label;

    const dropdown = document.createElement('div');
    dropdown.className = 'menubar__dropdown';

    menu.items.forEach((menuItem) => {
      if (menuItem.separator) {
        const sep = document.createElement('div');
        sep.className = 'menubar__dropdown-sep';
        dropdown.appendChild(sep);
        return;
      }

      const el = document.createElement('div');
      el.className = 'menubar__dropdown-item';
      if (menuItem.disabled) {
        el.classList.add('menubar__dropdown-item--disabled');
      }
      el.setAttribute('data-action', menuItem.action);

      const label = document.createElement('span');
      label.textContent = menuItem.label;
      el.appendChild(label);

      if (menuItem.shortcut) {
        const shortcut = document.createElement('span');
        shortcut.className = 'menubar__dropdown-shortcut';
        shortcut.textContent = menuItem.shortcut;
        el.appendChild(shortcut);
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        if (!menuItem.disabled) {
          bus.emit('menu:action', menuItem.action);
        }
      });

      dropdown.appendChild(el);
    });

    item.appendChild(dropdown);
    menubar.appendChild(item);

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeMenu === item) {
        closeAllMenus();
      } else {
        closeAllMenus();
        activeMenu = item;
        dropdown.style.display = 'block';
      }
    });

    item.addEventListener('mouseenter', () => {
      if (activeMenu && activeMenu !== item) {
        closeAllMenus();
        activeMenu = item;
        dropdown.style.display = 'block';
      }
    });
  });

  function closeAllMenus() {
    activeMenu = null;
    document.querySelectorAll('.menubar__dropdown').forEach((d) => {
      d.style.display = '';
    });
  }

  document.addEventListener('click', () => closeAllMenus());
}

function initToolbar() {
  const toolbar = $('toolbar');

  const tools = [
    { name: 'move', label: 'Move', key: 'V', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2v16M2 10h16M10 2l-3 3M10 2l3 3M10 18l-3-3M10 18l3-3M2 10l3-3M2 10l3 3M18 10l-3-3M18 10l-3 3"/></svg>` },
    { name: 'marquee', label: 'Marquee Select', key: 'M', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"><rect x="3" y="3" width="14" height="14" rx="1"/></svg>` },
    { name: 'lasso', label: 'Lasso', key: 'L', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12c0-4 3-7 7-7s5 3 5 5-2 4-4 5c-1.5.7-3 .5-4-.5s-1.5-2.5-.5-4"/><circle cx="6" cy="14" r="2"/></svg>` },
    { separator: true },
    { name: 'brush', label: 'Brush', key: 'B', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 3.5l2 2-9 9H5.5v-2l9-9z"/><path d="M12 6l2 2"/></svg>` },
    { name: 'eraser', label: 'Eraser', key: 'E', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 7l-6 6-4-4-3 3"/><path d="M3 17h14"/><path d="M7 13l-4 4"/></svg>` },
    { name: 'text', label: 'Text', key: 'T', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h10M10 4v14M7 18h6"/></svg>` },
    { name: 'shapes', label: 'Shapes', key: 'U', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="8" rx="1"/><circle cx="14" cy="14" r="4"/></svg>` },
    { separator: true },
    { name: 'paintbucket', label: 'Paint Bucket', key: 'G', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12.5 2.5l5 5-7 7H5.5v-5l7-7z"/><path d="M5.5 14.5L2 18"/></svg>` },
    { name: 'crop', label: 'Crop', key: 'C', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3v12h12M3 5h12v12"/></svg>` },
    { name: 'eyedropper', label: 'Eyedropper', key: 'I', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 2l3 3-5 5-2-2-6 6v2h2l6-6-2-2 5-5z"/><path d="M9 10l-4 4"/></svg>` },
    { name: 'magicwand', label: 'Magic Wand', key: 'W', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18L10 10M10 2l1.5 3.5L15 7l-3.5 1.5L10 12l-1.5-3.5L5 7l3.5-1.5L10 2z"/><path d="M15 14l.7 1.5L17 16.2l-1.3.7L15 18.5l-.7-1.6L13 16.2l1.3-.7z"/></svg>` },
    { name: 'zoom', label: 'Zoom', key: 'Z', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/><path d="M7 9h4M9 7v4"/></svg>` }
  ];

  tools.forEach((tool) => {
    if (tool.separator) {
      const sep = document.createElement('div');
      sep.className = 'toolbar__separator';
      toolbar.appendChild(sep);
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'toolbar__btn';
    btn.setAttribute('data-tool', tool.name);
    btn.setAttribute('data-tooltip', `${tool.label} (${tool.key})`);
    btn.setAttribute('title', `${tool.label} (${tool.key})`);
    btn.innerHTML = tool.icon;

    btn.addEventListener('click', () => {
      bus.emit('tool:select', tool.name);
    });

    toolbar.appendChild(btn);
  });

  bus.on('tool:changed', (toolName) => {
    document.querySelectorAll('.toolbar__btn').forEach((btn) => {
      btn.classList.toggle('toolbar__btn--active', btn.getAttribute('data-tool') === toolName);
    });
  });
}

function initOptionsBar() {
  const optionsbar = $('optionsbar');
  optionsbar.innerHTML = '<span style="color:var(--text-muted);font-size:11px;">Selecciona una herramienta</span>';
}

function initPanel() {
  const panel = $('panel');

  panel.innerHTML = `
    <div class="panel__section" data-section="layers">
      <div class="panel__header">
        <span>Capas</span>
        <span class="panel__header-icon">▾</span>
      </div>
      <div class="panel__content"></div>
    </div>

    <div class="panel__section" data-section="color">
      <div class="panel__header">
        <span>Color</span>
        <span class="panel__header-icon">▾</span>
      </div>
      <div class="panel__content"></div>
    </div>

    <div class="panel__section" data-section="properties">
      <div class="panel__header">
        <span>Propiedades</span>
        <span class="panel__header-icon">▾</span>
      </div>
      <div class="panel__content"></div>
    </div>

    <div class="panel__section" data-section="blending">
      <div class="panel__header">
        <span>Fusión</span>
        <span class="panel__header-icon">▾</span>
      </div>
      <div class="panel__content"></div>
    </div>
  `;

  panel.querySelectorAll('.panel__header').forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.closest('.panel__section');
      const content = section.querySelector('.panel__content');
      const icon = header.querySelector('.panel__header-icon');
      const collapsed = content.classList.toggle('panel__content--collapsed');
      icon.classList.toggle('panel__header-icon--collapsed', collapsed);
    });
  });

  initLayersPanel(panel.querySelector('[data-section="layers"] .panel__content'));
  initColorPanel(panel.querySelector('[data-section="color"] .panel__content'));
  initPropertiesPanel(panel.querySelector('[data-section="properties"] .panel__content'));
  initBlendingPanel(panel.querySelector('[data-section="blending"] .panel__content'));

  
  const historySection = document.createElement('div');
  historySection.className = 'panel__section';
  historySection.setAttribute('data-section', 'history');
  historySection.innerHTML = `
    <div class="panel__header">
      <span>Historial</span>
      <span class="panel__header-icon">▾</span>
    </div>
    <div class="panel__content"></div>
  `;
  panel.appendChild(historySection);
  
  historySection.querySelector('.panel__header').addEventListener('click', () => {
    const content = historySection.querySelector('.panel__content');
    const icon = historySection.querySelector('.panel__header-icon');
    const collapsed = content.classList.toggle('panel__content--collapsed');
    icon.classList.toggle('panel__header-icon--collapsed', collapsed);
  });
  
  import('./panels/history.js').then(m => m.initHistoryPanel(historySection.querySelector('.panel__content')));
}

function initStatusbar() {
  const statusbar = $('statusbar');

  statusbar.innerHTML = `
    <div class="statusbar__left">
      <span class="statusbar__item statusbar__item--tool" id="status-tool">Mover</span>
      <span class="statusbar__item" id="status-doc">1200 × 800 px</span>
    </div>
    <div class="statusbar__right">
      <span class="statusbar__item statusbar__item--coords" id="status-xy">X: 0 Y: 0</span>
      <span class="statusbar__item statusbar__item--zoom" id="status-zoom">100%</span>
    </div>
  `;

  bus.on('tool:changed', (toolName) => {
    const labels = {
      move: 'Mover',
      marquee: 'Selección',
      lasso: 'Lazo',
      brush: 'Pincel',
      eraser: 'Borrador',
      text: 'Texto',
      shapes: 'Formas',
      paintbucket: 'Relleno',
      magicwand: 'Varita mágica',
      crop: 'Recortar',
      eyedropper: 'Cuentagotas',
      zoom: 'Zoom'
    };
    $('status-tool').textContent = labels[toolName] || toolName;
  });

  bus.on('canvas:mousemove', (pos) => {
    $('status-xy').textContent = `X: ${pos.x} Y: ${pos.y}`;
  });

  bus.on('zoom:change', ({ zoom }) => {
    $('status-zoom').textContent = `${Math.round(zoom * 100)}%`;
  });

  bus.on('editor:newDocument', ({ width, height }) => {
    $('status-doc').textContent = `${width} × ${height} px`;
  });
}

function initDropzone() {
  const canvasArea = $('canvas-area');
  const dropzone = $('dropzone');

  canvasArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('canvas-area__dropzone--visible');
  });

  canvasArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('canvas-area__dropzone--visible');
  });

  canvasArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('canvas-area__dropzone--visible');

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      bus.emit('file:import', { file });
    }
  });
}
