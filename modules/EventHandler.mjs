const EventTypes = Object.freeze({
  MOUSEENTER: Object.freeze(Symbol("mouseenter")),
  MOUSELEAVE: Object.freeze(Symbol("mouseleave")),
  MOUSEWHEELUP: Object.freeze(Symbol("mousewheelup")),
  MOUSEWHEELDOWN: Object.freeze(Symbol("mousewheeldown")),
  MOUSEUP1: Object.freeze(Symbol("mouseup1")),
  MOUSEDOWN1: Object.freeze(Symbol("mousedown1")),
  MOUSEUP2: Object.freeze(Symbol("mouseup2")),
  MOUSEDOWN2: Object.freeze(Symbol("mousedown2")),
  MOUSEMOVE: Object.freeze(Symbol("mousemove")),
  KEYUP: Object.freeze(Symbol("keyup")),
  KEYDOWN: Object.freeze(Symbol("keydown")),
});

class Event {
  #type;
  #data;
  
  constructor(type, data) {
    this.#type = type;
    this.#data = data;
  }

  get type() {
    return this.#type;
  }

  get data() {
    return this.#data;
  }
}

class EventHandler {
  #eventQueue = [];
  #subscribers;

  constructor(renderer) {
    const canvas = renderer.canvasElement;
    
    if (canvas === null
      || canvas.__proto__.constructor.name !== "HTMLCanvasElement") {
      throw new Error(`Canvas element with ID '${canvasElementId}', does not exist`);
    }

    // Disable default right-click menu
    canvas.oncontextmenu = () => false;
    
    canvas.addEventListener("mouseenter", _ => {
      this.#eventQueue.push(new Event(EventTypes.MOUSEENTER, null));
    });

    canvas.addEventListener("mouseleave", _ => {
      this.#eventQueue.push(new Event(EventTypes.MOUSELEAVE, null));
    });
    
    canvas.addEventListener("wheel", ev => {
      if (ev.wheelDeltaY > 0) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEWHEELUP, null));
      }
      if (ev.wheelDeltaY < 0) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEWHEELDOWN, null));
      }
    });

    canvas.addEventListener("mouseup", ev => {
      if (ev.button === 0) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEUP1, null));
      }
      else if (ev.button === 2) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEUP2, null));
      }
    });
    
    canvas.addEventListener("mousedown", ev => {
      // Disable unwanted highlighting and selecting
      ev.preventDefault();

      if (ev.button === 0) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEDOWN1, null));
      }
      else if (ev.button === 2) {
        this.#eventQueue.push(new Event(EventTypes.MOUSEDOWN2, null));
      }
    });

    canvas.addEventListener("mousemove", ev => {
      const [x, y] = renderer.canvasToRendererCoordinates(ev.offsetX, ev.offsetY);
      this.#eventQueue.push(new Event(EventTypes.MOUSEMOVE, [x, y]));
    });

    document.addEventListener("keyup", ev => {
      this.#eventQueue.push(new Event(EventTypes.KEYUP, ev.code));
    });

    document.addEventListener("keydown", ev => {
      // Prevent scrolling
      if (ev.code === "ArrowUp" 
      || ev.code === "ArrowDown" 
      || ev.code === "ArrowLeft" 
      || ev.code === "ArrowRight") {
        ev.preventDefault();
      }
      this.#eventQueue.push(new Event(EventTypes.KEYDOWN, ev.code));
    });
    
    this.#subscribers = [];
  }

  subscribe(cb) {
    const id = Symbol();
    this.#subscribers.push([id, cb]);
    return id;
  }

  unsubscribe(subscribeId) {
    const i = this.#subscribers.findIndex(([id, _]) => id === subscribeId);
    if (i !== -1) this.#subscribers.splice(i, 1);
  }
  
  publish(event) {
    this.#eventQueue.push(event);
  }

  handleEvents() {
    let eventQueue = this.#eventQueue;
    this.#eventQueue = [];
    eventQueue.forEach(e => {
      this.#subscribers.forEach(([_, cb]) => cb(e));
    })
  }
}

export { EventHandler, Event, EventTypes }