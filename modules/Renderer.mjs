const Colors = Object.freeze({
  WHITE: "rgba(255,255,255,255)",
  BLACK: "rgba(0,0,0,255)",
  RED: "rgba(255,0,0,255)",
  GREEN: "rgba(0,255,0,255)",
  BLUE: "rgba(0,0,255,255)",
  YELLOW: "rgba(255,255,0,255)",
  MAGENTA: "rgba(255,0,255,255)",
  CYAN: "rgba(0,255,255,255)",
});

class Renderer {
  #canvas;
  #width;
  #height;
  #right;
  #left;
  #top;
  #bottom;
  #ctx;

  constructor(canvasElementId) {
    this.#canvas = document.getElementById(canvasElementId);
    if (this.#canvas === null
      || this.#canvas.__proto__.constructor.name !== "HTMLCanvasElement") {
      throw new Error(`Canvas element with ID '${canvasElementId}', does not exist`);
    }
    
    this.#width = this.#canvas.clientWidth;
    this.#height = this.#canvas.clientHeight;
    
    this.#right = this.#width / 2;
    this.#left = -this.#right;
    this.#top = this.#height / 2;
    this.#bottom = -this.#top;
    
    this.#ctx = this.#canvas.getContext("2d");
  }

  get width() { 
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get right() {
    return this.#right;
  }

  get left() {
    return this.#left;
  }

  get top() {
    return this.#top;
  }

  get bottom() {
    return this.#bottom;
  }

  clear(color) {
    this.#ctx.fillStyle = color;
    this.#ctx.fillRect(0, 0, this.width, this.height);
  }

  drawCircle(x, y, d, color, fill) {
    [x, y] = this.rendererToCanvasCoordinates(x, y);
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, d / 2, 0, 2 * Math.PI);
    this.#draw(color, fill);
  }

  drawRectangle(x, y, w, h, color, fill) {
    x -= w / 2;
    y += h / 2;
    [x, y] = this.rendererToCanvasCoordinates(x, y);
    this.#ctx.beginPath();
    this.#ctx.rect(x, y, w, h);
    this.#draw(color, fill);
  }
  
  drawTriangle(x, y, l, color, fill, angle) {
    angle -= Math.PI / 2
    let x1Dif = x - x
    let y1Dif = y + l / 2 - y;
    let x1 = (x1Dif * Math.cos(angle) - y1Dif * Math.sin(angle)) + x;
    let y1 = (x1Dif * Math.sin(angle) + y1Dif * Math.cos(angle)) + y;
    let x2Dif = x - l / 2 - x;
    let y2Dif = y - l / 2 - y;
    let x2 = (x2Dif * Math.cos(angle) - y2Dif * Math.sin(angle)) + x;
    let y2 = (x2Dif * Math.sin(angle) + y2Dif * Math.cos(angle)) + y;
    let x3Dif = x + l / 2 - x;
    let y3Dif = y - l / 2 - y;
    let x3 = (x3Dif * Math.cos(angle) - y3Dif * Math.sin(angle)) + x;
    let y3 = (x3Dif * Math.sin(angle) + y3Dif * Math.cos(angle)) + y;
    [x1, y1] = this.rendererToCanvasCoordinates(x1, y1);
    [x2, y2] = this.rendererToCanvasCoordinates(x2, y2);
    [x3, y3] = this.rendererToCanvasCoordinates(x3, y3);
    this.#ctx.beginPath();
    this.#ctx.moveTo(x1, y1);
    this.#ctx.lineTo(x2, y2);
    this.#ctx.lineTo(x3, y3);
    this.#ctx.closePath();
    this.#draw(color, fill);
  }

  drawLine(x1, y1, x2, y2, color) {
    [x1, y1] = this.rendererToCanvasCoordinates(x1, y1);
    [x2, y2] = this.rendererToCanvasCoordinates(x2, y2);
    this.#ctx.beginPath();
    this.#ctx.moveTo(x1, y1);
    this.#ctx.lineTo(x2, y2);
    this.#draw(color, false);
  }

  drawArrow(x1, y1, x2, y2, color) {
    this.drawLine(x1, y1, x2, y2, color);
    const angle = Renderer.#getLineAngle(x1, y1, x2, y2);
    this.drawTriangle(x2, y2, 5, color, true, angle);
  }

  drawText(x, y, text, color) {
    [x, y] = this.rendererToCanvasCoordinates(x, y);
    this.#ctx.font = "12px sans-serif"
    this.#ctx.strokeStyle = color;
    this.#ctx.textBaseline = "middle";
    this.#ctx.textAlign = "center";
    this.#ctx.strokeText(text, x, y);
  }

  measureText(text) {
    this.#ctx.font = "12px sans-serif"
    this.#ctx.textBaseline = "middle";
    this.#ctx.textAlign = "center";
    const textMetrics = this.#ctx.measureText(text);
    return [textMetrics.width, textMetrics.actualBoundingBoxDescent + textMetrics.actualBoundingBoxAscent];
  }

  #draw(color, fill) {
    this.#ctx.lineWidth = 1;
    this.#ctx.strokeStyle = color;
    this.#ctx.stroke();
    if (fill) {
      this.#ctx.fillStyle = color;
      this.#ctx.fill();
    }
  }

  static #getLineAngle(x1, y1, x2, y2) {
    if (x2 < x1) {
      return Math.PI + Math.atan((y2 - y1) / (x2 - x1));
    }
    return Math.atan((y2 - y1) / (x2 - x1));
  }

  rendererToCanvasCoordinates(x, y) {
    return [x + this.right, this.top - y]
  }

  canvasToRendererCoordinates(x, y) {
    return [x - this.right, this.top - y]
  }

  get canvasElement() {
    return this.#canvas;
  }
}

export { Renderer, Colors }