import { bus } from '../core/events.js';
import { updateOptionsBar } from './optionsbar.js';

const tools = new Map();
let currentTool = null;

export function registerTool(name, tool) {
  tools.set(name, tool);
}

export function getTool(name) {
  return tools.get(name);
}

export function getCurrentTool() {
  return currentTool;
}

export function initToolManager() {
  bus.on('tool:select', (toolName) => {
    if (currentTool && tools.has(currentTool)) {
      tools.get(currentTool).deactivate?.();
    }

    currentTool = toolName;
    const tool = tools.get(toolName);

    if (tool) {
      tool.activate?.();
    }

    bus.emit('tool:changed', toolName);
    updateOptionsBar(toolName);
  });

  bus.on('canvas:mousedown', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onMouseDown?.(e);
  });

  bus.on('canvas:mousemove', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onMouseMove?.(e);
  });

  bus.on('canvas:mouseup', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onMouseUp?.(e);
  });

  bus.on('canvas:click', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onClick?.(e);
  });

  bus.on('canvas:dblclick', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onDblClick?.(e);
  });

  bus.on('canvas:keydown', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onKeyDown?.(e);
  });

  bus.on('canvas:keyup', (e) => {
    const tool = tools.get(currentTool);
    if (tool) tool.onKeyUp?.(e);
  });
}


