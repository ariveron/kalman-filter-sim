import { EventTypes } from "./EventHandler.mjs"

class Controller {
  #eventHandler;
  #eventHandlerSubscribeId;
  #mouseX;
  #mouseY;
  #mouse1;
  #lastMouseDownX1;
  #lastMouseDownY1;
  #lastMouseUpX1;
  #lastMouseUpY1;
  #mouse2;
  #lastMouseDownX2;
  #lastMouseDownY2;
  #lastMouseUpX2;
  #lastMouseUpY2;
  #keys;

  constructor(eventHandler) {
    this.#mouseX = 0;
    this.#mouseY = 0;
    this.#mouse1 = false;
    this.#lastMouseDownX1 = 0;
    this.#lastMouseDownY1 = 0;
    this.#lastMouseUpX1 = 0;
    this.#lastMouseUpY1 = 0;
    this.#mouse2 = false;
    this.#lastMouseDownX2 = 0;
    this.#lastMouseDownY2 = 0;
    this.#lastMouseUpX2 = 0;
    this.#lastMouseUpY2 = 0;
    this.#keys = {};

    this.#eventHandler = eventHandler;
    this.#eventHandlerSubscribeId = eventHandler.subscribe((e) => {
      switch (e.type) {
        case EventTypes.MOUSELEAVE: {
          this.#mouse1 = false;
          this.#mouse2 = false;
        } break;
        case EventTypes.MOUSEUP1: {
          this.#mouse1 = false;
          this.#lastMouseUpX1 = this.#mouseX;
          this.#lastMouseUpY1 = this.#mouseY;
        } break;
        case EventTypes.MOUSEUP2: {
          this.#mouse2 = false;
          this.#lastMouseUpX2 = this.#mouseX;
          this.#lastMouseUpY2 = this.#mouseY;
        } break;
        case EventTypes.MOUSEDOWN1: {
          this.#mouse1 = true;
          this.#lastMouseDownX1 = this.#mouseX;
          this.#lastMouseDownY1 = this.#mouseY;
        } break;
        case EventTypes.MOUSEDOWN2: {
          this.#mouse2 = true;
          this.#lastMouseDownX2 = this.#mouseX;
          this.#lastMouseDownY2 = this.#mouseY;
        } break;
        case EventTypes.MOUSEMOVE: {
          [this.#mouseX, this.#mouseY] = e.data;
        } break;
        case EventTypes.KEYUP: {
          this.#keys[e.data] = false;
        } break;
        case EventTypes.KEYDOWN: {
          this.#keys[e.data] = true;
        } break;
        default:
          break;
    }});
  }

  get mouseX() {
    return this.#mouseX;
  }

  get mouseY() {
    return this.#mouseY;
  }

  get isMouseDown1() {
    return this.#mouse1;
  }

  get isMouseDown2() {
    return this.#mouse2;
  }

  get lastMouseDownX1() {
    return this.#lastMouseDownX1;
  }
  
  get lastMouseDownY1() {
    return this.#lastMouseDownY1;
  }

  get lastMouseDownX2() {
    this.#lastMouseDownX2;
  }
  
  get lastMouseDownY2() {
    this.#lastMouseDownY2;
  }
  
  get lastMouseUpX1() {
    return this.#lastMouseUpX1;
  }
  
  get lastMouseUpY1() {
    return this.#lastMouseUpY1;
  }

  get lastMouseUpX2() {
    this.#lastMouseUpX2;
  }
  
  get lastMouseUpY2() {
    this.#lastMouseUpY2;
  }

  isKeyDown(code) {
    if (code in this.#keys) return this.#keys[code];
    return false;
  }

  dispose() {
    this.#eventHandler.unsubscribe(this.#eventHandlerSubscribeId);
    this.#eventHandler = null;
  }
}

export { Controller }
