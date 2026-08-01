import { bus } from '../core/events.js';
import { editor } from '../core/editor.js';

const THEME = {
  bg: '#1e1e2e',
  border: '#313244',
  text: '#cdd6f4',
  muted: '#a6adc8',
  accent: '#89b4fa',
  btnBg: '#313244',
  btnHover: '#45475a',
};

const STYLE = {
  backdrop: `
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 5000;
    animation: fadeIn 0.15s ease;
  `,
  dialog: `
    background: ${THEME.bg};
    border: 1px solid ${THEME.border};
    border-radius: 12px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    min-width: 360px;
    max-width: 520px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    color: ${THEME.text};
    animation: fadeIn 0.2s ease;
  `,
  header: `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 12px;
    border-bottom: 1px solid ${THEME.border};
  `,
  title: `
    font-size: 15px;
    font-weight: 600;
    color: ${THEME.text};
    margin: 0;
  `,
  closeBtn: `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease;
    color: ${THEME.muted};
    border: none;
    background: none;
    font-size: 16px;
  `,
  body: `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  footer: `
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px 16px;
    border-top: 1px solid ${THEME.border};
  `,
  btn: `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
    user-select: none;
    border: none;
  `,
  btnPrimary: `
    background: ${THEME.accent};
    color: #fff;
  `,
  btnSecondary: `
    background: ${THEME.btnBg};
    color: ${THEME.text};
  `,
  input: `
    background: #111118;
    border: 1px solid ${THEME.border};
    border-radius: 6px;
    padding: 8px 12px;
    color: ${THEME.text};
    font-size: 13px;
    transition: border-color 0.15s ease;
    width: 100%;
  `,
  label: `
    font-size: 12px;
    font-weight: 500;
    color: ${THEME.muted};
  `,
};

function createStyle(tag, cssText) {
  const el = document.createElement(tag);
  el.style.cssText = cssText;
  return el;
}

function createCloseSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
}

function createBtn(label, variant) {
  const btn = createStyle('button', STYLE.btn + (variant === 'primary' ? STYLE.btnPrimary : STYLE.btnSecondary));
  btn.textContent = label;
  btn.addEventListener('mouseenter', () => { btn.style.background = THEME.btnHover; });
  btn.addEventListener('mouseleave', () => { btn.style.background = variant === 'primary' ? THEME.accent : THEME.btnBg; });
  return btn;
}

function injectKeyframes() {
  if (document.getElementById('dialog-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'dialog-keyframes';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * General dialog function
 * @param {{ title: string, content: string|HTMLElement, buttons?: Array<{label:string, value:any, variant?:string}>, onClose?: Function }} opts
 * @returns {Promise<any>}
 */
export function showDialog({ title, content, buttons = [{ label: 'Cerrar', value: null, variant: 'secondary' }], onClose }) {
  injectKeyframes();

  return new Promise((resolve) => {
    const backdrop = createStyle('div', STYLE.backdrop);
    backdrop.className = 'modal-backdrop';

    const dialog = createStyle('div', STYLE.dialog);
    dialog.className = 'dialog';

    const header = createStyle('div', STYLE.header);

    const titleEl = createStyle('span', STYLE.title);
    titleEl.textContent = title;
    header.appendChild(titleEl);

    const closeBtn = createStyle('button', STYLE.closeBtn);
    closeBtn.innerHTML = createCloseSvg();
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = THEME.btnHover; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = ''; });
    closeBtn.addEventListener('click', () => {
      backdrop.remove();
      if (onClose) onClose();
      resolve(null);
    });
    header.appendChild(closeBtn);

    const body = createStyle('div', STYLE.body);
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    const footer = createStyle('div', STYLE.footer);
    for (const b of buttons) {
      const btn = createBtn(b.label, b.variant);
      btn.addEventListener('click', () => {
        backdrop.remove();
        if (onClose) onClose();
        resolve(b.value);
      });
      footer.appendChild(btn);
    }

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    backdrop.appendChild(dialog);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
        if (onClose) onClose();
        resolve(null);
      }
    });

    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handler);
        backdrop.remove();
        if (onClose) onClose();
        resolve(null);
      }
    });

    document.body.appendChild(backdrop);
  });
}

/**
 * Canvas Size Dialog
 */
export function showCanvasSizeDialog() {
  injectKeyframes();

  bus.on('dialog:canvas-size', ({ width: initW, height: initH }) => {
    let currentW = initW;
    let currentH = initH;
    let lockRatio = true;
    const ratio = initW / initH;

    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    const rowW = document.createElement('div');
    rowW.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    const lblW = createStyle('label', STYLE.label);
    lblW.textContent = 'Ancho (px)';
    const inpW = createStyle('input', STYLE.input);
    inpW.type = 'number';
    inpW.min = '1';
    inpW.value = initW;
    inpW.addEventListener('focus', () => { inpW.style.borderColor = THEME.accent; });
    inpW.addEventListener('blur', () => { inpW.style.borderColor = THEME.border; });
    rowW.appendChild(lblW);
    rowW.appendChild(inpW);

    const rowH = document.createElement('div');
    rowH.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    const lblH = createStyle('label', STYLE.label);
    lblH.textContent = 'Alto (px)';
    const inpH = createStyle('input', STYLE.input);
    inpH.type = 'number';
    inpH.min = '1';
    inpH.value = initH;
    inpH.addEventListener('focus', () => { inpH.style.borderColor = THEME.accent; });
    inpH.addEventListener('blur', () => { inpH.style.borderColor = THEME.border; });
    rowH.appendChild(lblH);
    rowH.appendChild(inpH);

    const checkboxRow = document.createElement('label');
    checkboxRow.style.cssText = `display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:${THEME.muted};`;
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = true;
    chk.style.cssText = `width:14px;height:14px;accent-color:${THEME.accent};cursor:pointer;`;
    chk.addEventListener('change', () => { lockRatio = chk.checked; });
    const chkLabel = document.createElement('span');
    chkLabel.textContent = 'Mantener proporción';
    checkboxRow.appendChild(chk);
    checkboxRow.appendChild(chkLabel);

    inpW.addEventListener('input', () => {
      if (lockRatio) {
        const v = Number(inpW.value);
        if (v > 0) inpH.value = Math.round(v / ratio);
      }
    });
    inpH.addEventListener('input', () => {
      if (lockRatio) {
        const v = Number(inpH.value);
        if (v > 0) inpW.value = Math.round(v * ratio);
      }
    });

    container.appendChild(rowW);
    container.appendChild(rowH);
    container.appendChild(checkboxRow);

    showDialog({
      title: 'Tamaño de imagen',
      content: container,
      buttons: [
        { label: 'Cancelar', value: false, variant: 'secondary' },
        { label: 'Aceptar', value: true, variant: 'primary' },
      ],
    }).then((ok) => {
      if (ok) {
        const w = Number(inpW.value) || initW;
        const h = Number(inpH.value) || initH;
        editor.canvas.setWidth(w);
        editor.canvas.setHeight(h);
        editor.canvas.renderAll();
        bus.emit('editor:newDocument', { width: w, height: h });
        editor.saveState();
      }
    });
  });
}

/**
 * Shortcuts Dialog
 */
export function showShortcutsDialog() {
  injectKeyframes();

  bus.on('help:shortcuts', () => {
    const categories = [
      {
        name: 'General',
        shortcuts: [
          { keys: 'Ctrl+N', action: 'Nuevo documento' },
          { keys: 'Ctrl+O', action: 'Abrir archivo' },
          { keys: 'Ctrl+S', action: 'Guardar PNG' },
          { keys: 'Ctrl+Shift+S', action: 'Guardar PNG (como)' },
        ],
      },
      {
        name: 'Herramientas',
        shortcuts: [
          { keys: 'V', action: 'Mover' },
          { keys: 'B', action: 'Pincel' },
          { keys: 'E', action: 'Borrador' },
          { keys: 'T', action: 'Texto' },
          { keys: 'U', action: 'Formas' },
          { keys: 'C', action: 'Recortar' },
          { keys: 'I', action: 'Cuentagotas' },
          { keys: 'Z', action: 'Zoom' },
        ],
      },
      {
        name: 'Edición',
        shortcuts: [
          { keys: 'Ctrl+Z', action: 'Deshacer' },
          { keys: 'Ctrl+Shift+Z', action: 'Rehacer' },
          { keys: 'Ctrl+C', action: 'Copiar' },
          { keys: 'Ctrl+V', action: 'Pegar' },
          { keys: 'Ctrl+A', action: 'Seleccionar todo' },
          { keys: 'Del / Backspace', action: 'Eliminar' },
        ],
      },
      {
        name: 'Vista',
        shortcuts: [
          { keys: 'Ctrl+=', action: 'Zoom en' },
          { keys: 'Ctrl+-', action: 'Zoom out' },
          { keys: 'Ctrl+0', action: 'Ajustar a pantalla' },
          { keys: 'Ctrl+1', action: '100%' },
          { keys: 'Ctrl+Alt+I', action: 'Tamaño de imagen' },
        ],
      },
    ];

    const container = document.createElement('div');
    container.style.cssText = 'max-height:60vh;overflow-y:auto;display:flex;flex-direction:column;gap:16px;';

    for (const cat of categories) {
      const section = document.createElement('div');

      const heading = createStyle('div', `
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${THEME.accent};
        margin-bottom: 8px;
      `);
      heading.textContent = cat.name;
      section.appendChild(heading);

      const table = document.createElement('div');
      table.style.cssText = 'display:flex;flex-direction:column;gap:1px;';

      for (const s of cat.shortcuts) {
        const row = document.createElement('div');
        row.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background 0.12s ease;
        `;
        row.addEventListener('mouseenter', () => { row.style.background = THEME.btnHover; });
        row.addEventListener('mouseleave', () => { row.style.background = ''; });

        const action = createStyle('span', `font-size:12px;color:${THEME.text};`);
        action.textContent = s.action;

        const keys = createStyle('span', `
          font-size: 11px;
          color: ${THEME.muted};
          font-family: "Fira Code", "Cascadia Code", monospace;
          background: ${THEME.btnBg};
          padding: 2px 8px;
          border-radius: 4px;
        `);
        keys.textContent = s.keys;

        row.appendChild(action);
        row.appendChild(keys);
        table.appendChild(row);
      }

      section.appendChild(table);
      container.appendChild(section);
    }

    showDialog({
      title: 'Atajos de teclado',
      content: container,
      buttons: [
        { label: 'Cerrar', value: true, variant: 'primary' },
      ],
    });
  });
}

/**
 * About Dialog
 */
export function showAboutDialog() {
  injectKeyframes();

  bus.on('help:about', () => {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:8px 0;';

    const icon = createStyle('div', `
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: linear-gradient(135deg, ${THEME.accent}, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 4px 16px rgba(137,180,250,0.3);
    `);
    icon.textContent = 'NE';

    const name = createStyle('div', `font-size:18px;font-weight:700;color:${THEME.text};`);
    name.textContent = 'NextEdit';

    const ver = createStyle('div', `font-size:12px;color:${THEME.muted};`);
    ver.textContent = 'Versión 1.0';

    const desc = createStyle('div', `
      font-size: 12px;
      color: ${THEME.muted};
      max-width: 320px;
      line-height: 1.5;
    `);
    desc.textContent = 'Un editor de imágenes ligero y moderno, construido con Canvas y Fabric.js.';

    container.appendChild(icon);
    container.appendChild(name);
    container.appendChild(ver);
    container.appendChild(desc);

    showDialog({
      title: 'Acerca de',
      content: container,
      buttons: [
        { label: 'Cerrar', value: true, variant: 'primary' },
      ],
    });
  });
}

/**
 * Filter Dialog (floating panel, stays open)
 */
export function showFilterDialog(filterName, onApply) {
  injectKeyframes();

  let currentValue = 50;
  let previewEnabled = true;

  const panel = createStyle('div', `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${THEME.bg};
    border: 1px solid ${THEME.border};
    border-radius: 12px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    min-width: 320px;
    z-index: 5000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    color: ${THEME.text};
    animation: fadeIn 0.2s ease;
  `);
  panel.className = 'dialog';

  const header = createStyle('div', STYLE.header);
  const titleEl = createStyle('span', STYLE.title);
  titleEl.textContent = filterName;
  header.appendChild(titleEl);

  const closeBtn = createStyle('button', STYLE.closeBtn);
  closeBtn.innerHTML = createCloseSvg();
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = THEME.btnHover; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = ''; });
  closeBtn.addEventListener('click', () => {
    panel.remove();
    backdrop.remove();
  });
  header.appendChild(closeBtn);

  const body = createStyle('div', STYLE.body);

  const sliderRow = document.createElement('div');
  sliderRow.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  const sliderLabel = createStyle('label', STYLE.label);
  sliderLabel.textContent = 'Intensidad';

  const sliderContainer = document.createElement('div');
  sliderContainer.style.cssText = 'display:flex;align-items:center;gap:10px;';

  const slider = createStyle('input', `
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: ${THEME.border};
    outline: none;
    cursor: pointer;
  `);
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';

  const sliderThumbStyle = document.createElement('style');
  sliderThumbStyle.textContent = `
    .filter-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${THEME.accent};
      cursor: pointer;
    }
  `;
  document.head.appendChild(sliderThumbStyle);
  slider.classList.add('filter-slider');

  const sliderValue = createStyle('span', `
    font-size: 12px;
    color: ${THEME.muted};
    min-width: 32px;
    text-align: right;
    font-family: "Fira Code", "Cascadia Code", monospace;
  `);
  sliderValue.textContent = '50%';

  slider.addEventListener('input', () => {
    currentValue = Number(slider.value);
    sliderValue.textContent = currentValue + '%';
    if (previewEnabled && onApply) {
      onApply(currentValue, true);
    }
  });

  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(sliderValue);
  sliderRow.appendChild(sliderLabel);
  sliderRow.appendChild(sliderContainer);
  body.appendChild(sliderRow);

  const previewRow = document.createElement('label');
  previewRow.style.cssText = `display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:${THEME.muted};`;
  const previewChk = document.createElement('input');
  previewChk.type = 'checkbox';
  previewChk.checked = true;
  previewChk.style.cssText = `width:14px;height:14px;accent-color:${THEME.accent};cursor:pointer;`;
  previewChk.addEventListener('change', () => {
    previewEnabled = previewChk.checked;
    if (!previewEnabled && onApply) {
      onApply(0, false);
    } else if (previewEnabled && onApply) {
      onApply(currentValue, true);
    }
  });
  const previewLabel = createStyle('span', '');
  previewLabel.textContent = 'Vista previa en vivo';
  previewRow.appendChild(previewChk);
  previewRow.appendChild(previewLabel);
  body.appendChild(previewRow);

  const footer = createStyle('div', STYLE.footer);

  const applyBtn = createBtn('Aplicar', 'primary');
  applyBtn.addEventListener('click', () => {
    if (onApply) onApply(currentValue, false);
    panel.remove();
    backdrop.remove();
  });

  const resetBtn = createBtn('Restablecer', 'secondary');
  resetBtn.addEventListener('click', () => {
    slider.value = '50';
    currentValue = 50;
    sliderValue.textContent = '50%';
    if (onApply) onApply(50, false);
  });

  const cancelBtn = createBtn('Cancelar', 'secondary');
  cancelBtn.addEventListener('click', () => {
    if (onApply) onApply(0, false);
    panel.remove();
    backdrop.remove();
  });

  footer.appendChild(resetBtn);
  footer.appendChild(cancelBtn);
  footer.appendChild(applyBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);

  const backdrop = createStyle('div', STYLE.backdrop);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      if (onApply) onApply(0, false);
      panel.remove();
      backdrop.remove();
    }
  });

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  return {
    close() {
      if (onApply) onApply(0, false);
      panel.remove();
      backdrop.remove();
    },
  };
}

/**
 * Initialize all dialog bus listeners
 */
export function initDialogs() {
  showCanvasSizeDialog();
  showShortcutsDialog();
  showAboutDialog();
}
