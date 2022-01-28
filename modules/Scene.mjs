import { Matrix } from "./Matrix.mjs"
import { Colors } from "./Renderer.mjs"
import { EventTypes } from "./EventHandler.mjs"
import { randn } from "./Stats.mjs";

class Scene {
  #renderer;
  #eventHandler;
  #controller;
  #dt;
  #ax;
  #ay;
  #balls;
  #stateTransitionMatrix;
  #isPaused;
  #isShowingCoordinates;
  #culledBalls;
  #newBalls;
  #senseDtLimitElement;
  #senseDtElapsed;
  #senseNoiseStdevElement;
  #senseNoiseMean;
  #measurements;
  #predictions;
  #ballDiameter;
  #kalmanFilter;

  constructor(renderer, eventHandler, controller, dt, sensorDtElement, kalmanFilter, 
    sensorNoiseElement) {
    this.#renderer = renderer;
    this.#eventHandler = eventHandler;
    this.#controller = controller;
    this.#dt = dt;
    this.#ax = 0;
    this.#ay = 0;
    this.#balls = [];
    this.#stateTransitionMatrix = new Matrix([
      [1,0,dt, 0,dt*dt/2,      0],
      [0,1, 0,dt,      0,dt*dt/2],
      [0,0, 1, 0,     dt,      0],
      [0,0, 0, 1,      0,     dt],
      [0,0, 0, 0,      1,      0],
      [0,0, 0, 0,      0,      1]]);
    this.#isPaused = false;
    this.#isShowingCoordinates = true;
    this.#culledBalls = [];
    this.#newBalls = [];
    this.#senseDtLimitElement = sensorDtElement;
    this.#senseDtElapsed = this.#senseDtLimitElement.value * dt;
    this.#senseNoiseStdevElement = sensorNoiseElement;
    this.#senseNoiseMean = 0;
    this.#measurements = [];
    this.#predictions = [];
    this.#ballDiameter = 10;
    this.#kalmanFilter = kalmanFilter;

    this.#eventHandler.subscribe(e => {
      switch (e.type) {
        case EventTypes.MOUSEUP1: {
          const x = this.#controller.lastMouseDownX1;
          const y = this.#controller.lastMouseDownY1;
          const vx = this.#controller.mouseX - this.#controller.lastMouseDownX1;
          const vy = this.#controller.mouseY - this.#controller.lastMouseDownY1;
          this.#createBall(x, y, vx, vy);
        } break;
        case EventTypes.KEYDOWN: {
          switch (e.data) {
            case "KeyP":
              this.#isPaused = !this.#isPaused;
              break;
            case "KeyC":
              this.#isShowingCoordinates = !this.#isShowingCoordinates;
              break;
            default:
              break;
          }
        } break;
        default:
          break;
      }
    });
  }

  get dt() {
    return this.#dt;
  }

  update() {
    this.#eventHandler.handleEvents();
    this.#updateWorldAcceleration();
    if (!this.#isPaused && this.#balls.length > 0) {
      this.#cullBalls();
      this.#updateBallStates();
      this.#updateKalmanFilter();
    }
  }

  #updateWorldAcceleration() {
    const keyUpdateRate = 0.1;
    if (this.#controller.isKeyDown("ArrowUp")) {
      this.#ay += keyUpdateRate;
    }
    if (this.#controller.isKeyDown("ArrowDown")) {
      this.#ay -= keyUpdateRate;
    }
    if (this.#controller.isKeyDown("ArrowLeft")) {
      this.#ax -= keyUpdateRate;
    }
    if (this.#controller.isKeyDown("ArrowRight")) {
      this.#ax += keyUpdateRate;
    }
  }

  #createBall(x, y, vx, vy) {
    const newBall = [
      Symbol(), 
      new Matrix([
        [       x],
        [       y],
        [      vx],
        [      vy],
        [this.#ax],
        [this.#ay]])];
    this.#balls.push(newBall);
    this.#newBalls.push(newBall);
  }

  #updateBallStates() {
    this.#balls = this.#balls.map(([id, state]) => {
      state._[4][0] = this.#ax;
      state._[5][0] = this.#ay;
      state = this.#stateTransitionMatrix.mul(state);
      return [id, state];
    });
  }

  #cullBalls() {
    const cullingDistance = this.#renderer.width * 2;
    const keptBalls = [];
    this.#balls.forEach(([id, state]) => {
      const x = state._[0][0];
      const y = state._[1][0];
      const distance = Math.sqrt(x*x + y*y);
      if (distance > cullingDistance) this.#culledBalls.push([id, state]);
      else keptBalls.push([id, state]);
    });
    this.#balls = keptBalls;
  }

  #updateKalmanFilter() {
    this.#senseDtElapsed += this.#dt;
    if (this.#senseDtElapsed >= this.#senseDtLimitElement.value * this.#dt) {
      this.#senseDtElapsed = 0;

      if (this.#culledBalls.length > 0) {
        const culledBallIds = this.#culledBalls.map(([id, _]) => id);
        this.#culledBalls = [];
        this.#kalmanFilter.stopTracking(culledBallIds);
      }

      if (this.#newBalls.length > 0) {
        const newBallIds = this.#newBalls.map(([id, _]) => id);
        this.#newBalls = [];
        this.#kalmanFilter.startTracking(newBallIds);
      }
      
      this.#measurements = this.#balls.map(([id, state]) => {
        const x = state._[0][0] + randn(this.#senseNoiseMean, this.#senseNoiseStdevElement.value);
        const y = state._[1][0] + randn(this.#senseNoiseMean, this.#senseNoiseStdevElement.value);
        return [id, x, y];
      });
      this.#predictions = this.#kalmanFilter.updateAndPredict(this.#measurements);
    }
  }

  draw() {
    this.#renderer.clear(Colors.BLACK);
    this.#drawBallLauncher();
    this.#drawWorldAcceleration();
    this.#drawBalls();
    this.#drawMeasurements();
    this.#drawPredictions();
    this.#drawCoordinates();
  }

  #drawBallLauncher() {
    if (this.#controller.isMouseDown1) {
      const proposedVX = this.#controller.mouseX - this.#controller.lastMouseDownX1;
      const proposedVY = this.#controller.mouseY - this.#controller.lastMouseDownY1;

      this.#renderer.drawCircle(this.#controller.lastMouseDownX1, this.#controller.lastMouseDownY1,
        this.#ballDiameter, Colors.WHITE, true);
      this.#renderer.drawText(this.#controller.mouseX + 15, this.#controller.mouseY + 15,
        `< ${proposedVX} , ${proposedVY} >`, Colors.GREEN);
      this.#renderer.drawArrow(
        this.#controller.lastMouseDownX1, this.#controller.lastMouseDownY1, 
        this.#controller.mouseX, this.#controller.mouseY, 
        Colors.WHITE);
    }
  }

  #drawWorldAcceleration() {
    const [textW, textH] = this.#renderer.measureText("x:232.23");
    const text_x = this.#renderer.right - textW;
    const text_y = this.#renderer.top - textH;
    this.#renderer.drawText(text_x, text_y, `ax:${this.#ax.toFixed(2)}`, Colors.GREEN);
    this.#renderer.drawText(text_x, text_y - textH - 2, `ay:${this.#ay.toFixed(2)}`, Colors.GREEN);
  }

  #drawBalls() {
    this.#balls.forEach(([_, ballState]) => {
      const [ballX, ballY] = [ballState._[0][0], ballState._[1][0]];
      this.#renderer.drawCircle(ballX, ballY, this.#ballDiameter, Colors.WHITE, true);
    });
  }

  #drawMeasurements() {
    this.#measurements.forEach(([_, ballX, ballY]) => {
      this.#renderer.drawCircle(ballX, ballY, this.#ballDiameter, Colors.YELLOW, false);
    });
  }
  
  #drawPredictions() {
    this.#predictions.forEach(([_, ballX, ballY, varX, varY]) => {
      this.#renderer.drawRectangle(
        ballX, ballY, this.#ballDiameter + varX, this.#ballDiameter + varY, Colors.RED, false);
    });
  }

  #drawCoordinates() {
    if (this.#isShowingCoordinates) {
      if (!this.#controller.isMouseDown1) {
        this.#renderer.drawText(this.#controller.mouseX - 30, this.#controller.mouseY - 30,
          `( ${this.#controller.mouseX} , ${this.#controller.mouseY} )`, Colors.GREEN);
      } else {
        this.#renderer.drawText(
          this.#controller.lastMouseDownX1 + 15, this.#controller.lastMouseDownY1 + 15,
          `( ${this.#controller.lastMouseDownX1} , ${this.#controller.lastMouseDownY1} )`,
           Colors.GREEN);
      }
    }
  }
}

export { Scene }
