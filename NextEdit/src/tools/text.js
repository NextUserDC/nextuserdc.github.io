import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let fontFamily = 'Arial';
let fontSize = 32;
let fontWeight = 'normal';
let fontStyle = 'normal';
let textColor = '#000000';

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
  'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'
];

export default {
  name: 'text',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h10M10 4v14M7 18h6"/></svg>`,
  shortcut: 't',

  activate() {
    const canvas = editor.canvas;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.setCursor('text');
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  },

  deactivate() {
    const canvas = editor.canvas;
    const active = canvas.getActiveObject();
    if (active && active.isEditing) {
      active.exitEditing();
    }
    canvas.discardActiveObject();
    canvas.setCursor('default');
    const ta = document.activeElement;
    if (ta && ta.blur) ta.blur();
  },

  onMouseDown(e) {
    const canvas = editor.canvas;
    const pointer = canvas.getScenePoint(e.e);

    const text = new fabric.IText('Texto', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      fill: textColor,
      editable: true
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.renderAll();
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML() {
    const fontOptions = FONTS.map(f =>
      `<option value="${f}" ${f === fontFamily ? 'selected' : ''}>${f}</option>`
    ).join('');

    return `
      <div class="tool-options-group">
        <label>Fuente</label>
        <select id="text-font">${fontOptions}</select>
      </div>
      <div class="tool-options-group">
        <label>Tamaño</label>
        <input type="number" id="text-size" min="8" max="200" value="${fontSize}" />
      </div>
      <div class="tool-options-group">
        <button id="text-bold" class="tool-btn ${fontWeight === 'bold' ? 'active' : ''}" title="Negrita"><b>B</b></button>
        <button id="text-italic" class="tool-btn ${fontStyle === 'italic' ? 'active' : ''}" title="Cursiva"><i>I</i></button>
      </div>
      <div class="tool-options-group">
        <label>Color</label>
        <input type="color" id="text-color" value="${textColor}" />
      </div>
    `;
  }
};

bus.on('tool:optionsBind', (data) => {
  if (data.tool !== 'text') return;

  const fontSelect = document.getElementById('text-font');
  const sizeInput = document.getElementById('text-size');
  const boldBtn = document.getElementById('text-bold');
  const italicBtn = document.getElementById('text-italic');
  const colorInput = document.getElementById('text-color');

  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      fontFamily = e.target.value;
    });
  }

  if (sizeInput) {
    sizeInput.addEventListener('input', (e) => {
      fontSize = parseInt(e.target.value, 10) || 32;
    });
  }

  if (boldBtn) {
    boldBtn.addEventListener('click', () => {
      fontWeight = fontWeight === 'bold' ? 'normal' : 'bold';
      boldBtn.classList.toggle('active');
    });
  }

  if (italicBtn) {
    italicBtn.addEventListener('click', () => {
      fontStyle = fontStyle === 'italic' ? 'normal' : 'italic';
      italicBtn.classList.toggle('active');
    });
  }

  if (colorInput) {
    colorInput.addEventListener('input', (e) => {
      textColor = e.target.value;
    });
  }
});
