import { editor } from '../core/editor.js';
import * as fabric from 'fabric';
import { bus } from '../core/events.js';

let textFont = 'Arial';
let textSize = 32;
let textBold = false;
let textItalic = false;
let textColor = '#000000';
let textAlign = 'left';
let textLineHeight = 1.16;
let textCharSpacing = 0;
let textUnderline = false;
let textLinethrough = false;
let textStroke = 'transparent';
let textStrokeWidth = 0;
let textShadowBlur = 0;
let textShadowOffsetX = 0;
let textShadowOffsetY = 0;
let textShadowColor = 'rgba(0,0,0,1)';

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
  'Georgia', 'Verdana', 'Impact', 'Comic Sans MS',
  'Trebuchet MS', 'Palatino', 'Garamond', 'Bookman',
  'Tahoma', 'Calibri', 'Cambria', 'Futura',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Playfair Display', 'Oswald', 'Raleway', 'Source Code Pro'
];

function applyOptionsToObj(obj) {
  if (!obj) return;
  obj.set({
    fontFamily: textFont,
    fontSize: textSize,
    fontWeight: textBold ? 'bold' : 'normal',
    fontStyle: textItalic ? 'italic' : 'normal',
    fill: textColor,
    textAlign: textAlign,
    lineHeight: textLineHeight,
    charSpacing: textCharSpacing,
    underline: textUnderline,
    linethrough: textLinethrough,
    stroke: textStroke,
    strokeWidth: textStrokeWidth,
    shadow: new fabric.Shadow({
      color: textShadowColor,
      blur: textShadowBlur,
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY
    })
  });
}

function getOptionsHTML() {
  const fontOptions = FONTS.map(f =>
    `<option value="${f}" ${f === textFont ? 'selected' : ''}>${f}</option>`
  ).join('');

  return `
    <div class="optionsbar__group">
      <label class="optionsbar__label">Fuente</label>
      <select class="optionsbar__select" id="text-font">${fontOptions}</select>
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Tamaño</label>
      <input class="optionsbar__input" type="number" id="text-size" min="8" max="200" value="${textSize}" style="width:52px" />
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <button id="text-bold" class="optionsbar__btn ${textBold ? 'optionsbar__btn--active' : ''}" title="Negrita"><b>B</b></button>
      <button id="text-italic" class="optionsbar__btn ${textItalic ? 'optionsbar__btn--active' : ''}" title="Cursiva"><i>I</i></button>
      <button id="text-underline" class="optionsbar__btn ${textUnderline ? 'optionsbar__btn--active' : ''}" title="Subrayado"><u>U</u></button>
      <button id="text-linethrough" class="optionsbar__btn ${textLinethrough ? 'optionsbar__btn--active' : ''}" title="Tachado"><s>S</s></button>
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Color</label>
      <input class="optionsbar__input" type="color" id="text-color" value="${textColor}" />
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Alineación</label>
      <button id="text-align-left" class="optionsbar__btn ${textAlign === 'left' ? 'optionsbar__btn--active' : ''}" title="Izquierda">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1h12M1 4h8M1 7h12M1 10h6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button id="text-align-center" class="optionsbar__btn ${textAlign === 'center' ? 'optionsbar__btn--active' : ''}" title="Centro">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1h12M3 4h8M1 7h12M4 10h6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button id="text-align-right" class="optionsbar__btn ${textAlign === 'right' ? 'optionsbar__btn--active' : ''}" title="Derecha">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1h12M5 4h8M1 7h12M7 10h6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button id="text-align-justify" class="optionsbar__btn ${textAlign === 'justify' ? 'optionsbar__btn--active' : ''}" title="Justificar">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1h12M1 4h12M1 7h12M1 10h12" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Altura de línea</label>
      <input class="optionsbar__input" type="number" id="text-line-height" min="0.5" max="3" step="0.01" value="${textLineHeight}" style="width:56px" />
    </div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Espaciado</label>
      <input class="optionsbar__input" type="number" id="text-char-spacing" min="-200" max="500" step="1" value="${textCharSpacing}" style="width:56px" />
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Trazo</label>
      <input class="optionsbar__input" type="color" id="text-stroke" value="${textStroke}" />
      <input class="optionsbar__input" type="number" id="text-stroke-width" min="0" max="20" step="1" value="${textStrokeWidth}" style="width:44px" />
    </div>
    <div class="optionsbar__divider"></div>
    <div class="optionsbar__group">
      <label class="optionsbar__label">Sombra</label>
      <input class="optionsbar__input" type="color" id="text-shadow-color" value="${textShadowColor}" />
      <input class="optionsbar__input" type="number" id="text-shadow-blur" min="0" max="100" step="1" value="${textShadowBlur}" style="width:44px" title="Desenfoque" />
      <input class="optionsbar__input" type="number" id="text-shadow-offset-x" min="-50" max="50" step="1" value="${textShadowOffsetX}" style="width:44px" title="Offset X" />
      <input class="optionsbar__input" type="number" id="text-shadow-offset-y" min="-50" max="50" step="1" value="${textShadowOffsetY}" style="width:44px" title="Offset Y" />
    </div>
  `;
}

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

    const text = new fabric.Textbox('Texto', {
      left: pointer.x,
      top: pointer.y,
      width: 300,
      fontFamily: textFont,
      fontSize: textSize,
      fontWeight: textBold ? 'bold' : 'normal',
      fontStyle: textItalic ? 'italic' : 'normal',
      fill: textColor,
      textAlign: textAlign,
      lineHeight: textLineHeight,
      charSpacing: textCharSpacing,
      underline: textUnderline,
      linethrough: textLinethrough,
      stroke: textStroke,
      strokeWidth: textStrokeWidth,
      editable: true,
      shadow: new fabric.Shadow({
        color: textShadowColor,
        blur: textShadowBlur,
        offsetX: textShadowOffsetX,
        offsetY: textShadowOffsetY
      })
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.renderAll();
  },

  onMouseMove() {},
  onMouseUp() {},

  getOptionsHTML
};

bus.on('tool:option', (data) => {
  const { key, value } = data;

  if (key === 'textFont') textFont = value;
  else if (key === 'textSize') textSize = parseInt(value, 10) || 32;
  else if (key === 'textBold') textBold = !!value;
  else if (key === 'textItalic') textItalic = !!value;
  else if (key === 'textColor') textColor = value;
  else if (key === 'textAlign') textAlign = value;
  else if (key === 'textLineHeight') textLineHeight = parseFloat(value) || 1.16;
  else if (key === 'textCharSpacing') textCharSpacing = parseInt(value, 10) || 0;
  else if (key === 'textUnderline') textUnderline = !!value;
  else if (key === 'textLinethrough') textLinethrough = !!value;
  else if (key === 'textStroke') textStroke = value;
  else if (key === 'textStrokeWidth') textStrokeWidth = parseInt(value, 10) || 0;
  else if (key === 'textShadowBlur') textShadowBlur = parseInt(value, 10) || 0;
  else if (key === 'textShadowOffsetX') textShadowOffsetX = parseInt(value, 10) || 0;
  else if (key === 'textShadowOffsetY') textShadowOffsetY = parseInt(value, 10) || 0;
  else if (key === 'textShadowColor') textShadowColor = value;

  const canvas = editor.canvas;
  const active = canvas?.getActiveObject();
  if (active && active.type === 'textbox') {
    applyOptionsToObj(active);
    canvas.renderAll();
  }
});
