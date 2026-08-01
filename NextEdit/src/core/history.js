import { bus } from './events.js';

const MAX_STATES = 50;

export class History {
  constructor() {
    this._states = [];
    this._position = -1;
  }

  get canUndo() {
    return this._position > 0;
  }

  get canRedo() {
    return this._position < this._states.length - 1;
  }

  get position() {
    return this._position;
  }

  get total() {
    return this._states.length;
  }

  push(state) {
    if (this._position < this._states.length - 1) {
      this._states = this._states.slice(0, this._position + 1);
    }

    this._states.push(JSON.parse(JSON.stringify(state)));

    if (this._states.length > MAX_STATES) {
      this._states.shift();
    } else {
      this._position++;
    }

    this._emitChange();
  }

  undo() {
    if (!this.canUndo) return null;
    this._position--;
    this._emitChange();
    return JSON.parse(JSON.stringify(this._states[this._position]));
  }

  redo() {
    if (!this.canRedo) return null;
    this._position++;
    this._emitChange();
    return JSON.parse(JSON.stringify(this._states[this._position]));
  }

  clear() {
    this._states = [];
    this._position = -1;
    this._emitChange();
  }

  _emitChange() {
    bus.emit('history:change', {
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      position: this._position,
      total: this._states.length
    });
  }
}
