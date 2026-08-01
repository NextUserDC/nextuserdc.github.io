import * as fabric from 'fabric';
import { bus } from '../core/events.js';
import { editor } from '../core/editor.js';

export const FILTER_DEFS = [
  {
    name: 'Brillo',
    action: 'filter:brightness',
    fabricFilter: 'Brightness',
    min: -1,
    max: 1,
    default: 0,
    step: 0.01,
    unit: '',
    param: 'brightness'
  },
  {
    name: 'Contraste',
    action: 'filter:contrast',
    fabricFilter: 'Contrast',
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    unit: '',
    param: 'contrast'
  },
  {
    name: 'Saturación',
    action: 'filter:saturation',
    fabricFilter: 'Saturation',
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    unit: '',
    param: 'saturation'
  },
  {
    name: 'Desenfoque',
    action: 'filter:blur',
    fabricFilter: 'Blur',
    min: 0,
    max: 1,
    default: 0,
    step: 0.01,
    unit: '',
    param: 'blur'
  },
  {
    name: 'Rotación de tono',
    action: 'filter:hue-rotation',
    fabricFilter: 'HueRotation',
    min: -180,
    max: 180,
    default: 0,
    step: 1,
    unit: '°',
    param: 'rotation'
  },
  {
    name: 'Ruido',
    action: 'filter:noise',
    fabricFilter: 'Noise',
    min: 0,
    max: 1000,
    default: 0,
    step: 10,
    unit: '',
    param: 'noise'
  },
  {
    name: 'Pixelar',
    action: 'filter:pixelate',
    fabricFilter: 'Pixelate',
    min: 1,
    max: 20,
    default: 1,
    step: 1,
    unit: '',
    param: 'blocksize'
  },
  {
    name: 'Escala de grises',
    action: 'filter:grayscale',
    fabricFilter: 'Grayscale',
    boolean: true,
    default: false,
    param: 'mode'
  },
  {
    name: 'Invertir',
    action: 'filter:invert',
    fabricFilter: 'Invert',
    boolean: true,
    default: false,
    param: 'invert'
  }
];

function findFilterDef(filterName) {
  return FILTER_DEFS.find((f) => f.fabricFilter === filterName);
}

function formatValue(value, unit) {
  if (unit === '°') return `${Math.round(value)}${unit}`;
  if (Number.isInteger(value)) return `${value}${unit}`;
  return `${parseFloat(value.toFixed(2))}${unit}`;
}

export function applyFilterToImage(imageObj, filterName, value) {
  if (!imageObj || imageObj.type !== 'image') return;

  const def = findFilterDef(filterName);
  if (!def) return;

  let filters = imageObj.filters || [];

  const existingIdx = filters.findIndex((f) => f && f.type === filterName);
  if (existingIdx !== -1) {
    if (def.boolean) {
      filters.splice(existingIdx, 1);
    } else {
      filters[existingIdx][def.param] = value;
    }
  } else {
    if (def.boolean && value) {
      const newFilter = new fabric.filters[filterName]();
      filters.push(newFilter);
    } else if (!def.boolean) {
      const newFilter = new fabric.filters[filterName]({ [def.param]: value });
      filters.push(newFilter);
    }
  }

  imageObj.filters = filters;
  imageObj.applyFilters();
}

function removeFiltersFromImage(imageObj, filterName) {
  if (!imageObj || imageObj.type !== 'image') return;
  const filters = (imageObj.filters || []).filter((f) => f && f.type !== filterName);
  imageObj.filters = filters;
  imageObj.applyFilters();
}

function getSelectedImage() {
  const active = editor.canvas.getActiveObject();
  if (active && active.type === 'image') return active;
  return null;
}

function removeExistingDialog() {
  const existing = document.querySelector('.modal-overlay.filter-dialog');
  if (existing) existing.remove();
}

export function showFilterDialog(filterName) {
  const def = findFilterDef(filterName);
  if (!def) return;

  const imageObj = getSelectedImage();
  if (!imageObj) {
    bus.emit('toast:show', { type: 'warning', message: 'Selecciona una imagen para aplicar filtros.' });
    return;
  }

  removeExistingDialog();

  const isBoolean = !!def.boolean;
  let currentValue = isBoolean ? false : (def.default ?? 0);
  let previewEnabled = true;
  let originalFiltersSnapshot = (imageObj.filters || []).map((f) => {
    if (!f) return null;
    return new fabric.filters[f.type]({ ...f });
  });

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay filter-dialog';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <span class="modal__title">${def.name}</span>
        <button class="modal__close" data-action="cancel" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal__body">
        ${isBoolean ? `
          <div style="display:flex;align-items:center;gap:12px;">
            <label class="properties__checkbox">
              <input type="checkbox" id="filter-toggle" />
              <span>Activar</span>
            </label>
          </div>
        ` : `
          <div class="form-group">
            <label class="form-group__label">Valor</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <input
                type="range"
                id="filter-slider"
                min="${def.min}"
                max="${def.max}"
                step="${def.step}"
                value="${currentValue}"
                style="flex:1;accent-color:var(--accent);height:4px;"
              />
              <span id="filter-value-display" style="min-width:48px;text-align:right;font-family:monospace;font-size:12px;color:var(--text-muted);">
                ${formatValue(currentValue, def.unit)}
              </span>
            </div>
          </div>
        `}
        <label class="properties__checkbox" style="margin-top:4px;">
          <input type="checkbox" id="filter-preview" checked />
          <span>Vista previa en vivo</span>
        </label>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" id="filter-reset">Restablecer</button>
        <button class="btn btn--ghost" id="filter-cancel">Cancelar</button>
        <button class="btn btn--primary" id="filter-apply">Aplicar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const slider = overlay.querySelector('#filter-slider');
  const toggle = overlay.querySelector('#filter-toggle');
  const valueDisplay = overlay.querySelector('#filter-value-display');
  const previewCheckbox = overlay.querySelector('#filter-preview');
  const applyBtn = overlay.querySelector('#filter-apply');
  const resetBtn = overlay.querySelector('#filter-reset');
  const cancelBtn = overlay.querySelector('#filter-cancel');
  const closeBtn = overlay.querySelector('.modal__close');

  function applyPreview() {
    if (!previewEnabled) return;
    if (isBoolean) {
      removeFiltersFromImage(imageObj, filterName);
      if (currentValue) {
        const f = new fabric.filters[filterName]();
        imageObj.filters = [...(imageObj.filters || []), f];
      }
    } else {
      removeFiltersFromImage(imageObj, filterName);
      const f = new fabric.filters[filterName]({ [def.param]: currentValue });
      imageObj.filters = [...(imageObj.filters || []), f];
    }
    imageObj.applyFilters();
    editor.canvas.renderAll();
  }

  function restoreOriginal() {
    imageObj.filters = (originalFiltersSnapshot || []).filter(Boolean).map((f) => {
      return new fabric.filters[f.type]({ ...f });
    });
    imageObj.applyFilters();
    editor.canvas.renderAll();
  }

  if (slider) {
    slider.addEventListener('input', () => {
      currentValue = parseFloat(slider.value);
      if (valueDisplay) valueDisplay.textContent = formatValue(currentValue, def.unit);
      applyPreview();
    });
  }

  if (toggle) {
    toggle.addEventListener('change', () => {
      currentValue = toggle.checked;
      applyPreview();
    });
  }

  if (previewCheckbox) {
    previewCheckbox.addEventListener('change', () => {
      previewEnabled = previewCheckbox.checked;
      if (!previewEnabled) {
        restoreOriginal();
      } else {
        applyPreview();
      }
    });
  }

  function closeDialog() {
    restoreOriginal();
    overlay.remove();
  }

  cancelBtn.addEventListener('click', closeDialog);
  closeBtn.addEventListener('click', closeDialog);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });

  resetBtn.addEventListener('click', () => {
    currentValue = isBoolean ? false : (def.default ?? 0);
    if (slider) slider.value = currentValue;
    if (valueDisplay) valueDisplay.textContent = formatValue(currentValue, def.unit);
    if (toggle) toggle.checked = false;
    restoreOriginal();
  });

  applyBtn.addEventListener('click', () => {
    if (isBoolean) {
      removeFiltersFromImage(imageObj, filterName);
      if (currentValue) {
        const f = new fabric.filters[filterName]();
        imageObj.filters = [...(imageObj.filters || []), f];
      }
    } else {
      removeFiltersFromImage(imageObj, filterName);
      const f = new fabric.filters[filterName]({ [def.param]: currentValue });
      imageObj.filters = [...(imageObj.filters || []), f];
    }
    imageObj.applyFilters();
    editor.canvas.renderAll();
    editor.saveState();
    bus.emit('filter:applied', { filterName, value: currentValue });
    overlay.remove();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDialog();
  });

  applyPreview();
}

function handleBooleanFilter(filterName) {
  const imageObj = getSelectedImage();
  if (!imageObj) {
    bus.emit('toast:show', { type: 'warning', message: 'Selecciona una imagen para aplicar filtros.' });
    return;
  }

  const def = findFilterDef(filterName);
  if (!def) return;

  const existingIdx = (imageObj.filters || []).findIndex((f) => f && f.type === filterName);
  if (existingIdx !== -1) {
    imageObj.filters.splice(existingIdx, 1);
  } else {
    const f = new fabric.filters[filterName]();
    imageObj.filters = [...(imageObj.filters || []), f];
  }

  imageObj.applyFilters();
  editor.canvas.renderAll();
  editor.saveState();
  bus.emit('filter:applied', {
    filterName,
    value: existingIdx === -1
  });
}

export function initFilters() {
  FILTER_DEFS.forEach((def) => {
    if (def.boolean) return;
    bus.on(def.action, (data) => {
      const value = data?.value ?? def.default;
      showFilterDialog(def.fabricFilter);
    });
  });

  bus.on('filter:show-dialog', (data) => {
    const filterName = data?.filterName;
    if (filterName) showFilterDialog(filterName);
  });

  bus.on('filter:apply-grayscale', () => handleBooleanFilter('Grayscale'));
  bus.on('filter:apply-invert', () => handleBooleanFilter('Invert'));
}
