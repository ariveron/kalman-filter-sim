import { Renderer } from "./modules/Renderer.mjs";
import { EventHandler } from "./modules/EventHandler.mjs";
import { Controller } from "./modules/Controller.mjs";
import { Scene } from "./modules/Scene.mjs";
import { SceneManager } from "./modules/SceneManager.mjs";
import { KalmanFilter } from "./modules/KalmanFilter.mjs";
import { NumericalScalarElement, NumericalTableElement } from "./modules/ElementWrappers.mjs";
import { Matrix } from "./modules/Matrix.mjs";

// Create input elements and wrapper objects
const inputsDiv = document.getElementById("inputs");
const sensorDtElement = new NumericalScalarElement(1, "sensor dt seconds = 1/60 *", inputsDiv, true);
const sensorNoiseElement = new NumericalScalarElement(10, "sensor noise stdev =", inputsDiv, false);
const xMatrixElement = new NumericalTableElement(
  new Matrix([
    [0.0], // x
    [0.0], // y
    [0.0], // vx
    [0.0], // vy
    [0.0], // ax
    [0.0], // ay
  ]),
  "starting X matrix =", ["x", "y", "vx", "vy", "ax", "ay"], [""], inputsDiv, false 
);
const pMatrixElement = new NumericalTableElement(
  new Matrix([
    [9999.0,    0.0,    0.0,    0.0,    0.0,    0.0],
    [   0.0, 9999.0,    0.0,    0.0,    0.0,    0.0],
    [   0.0,    0.0, 9999.0,    0.0,    0.0,    0.0],
    [   0.0,    0.0,    0.0, 9999.0,    0.0,    0.0],
    [   0.0,    0.0,    0.0,    0.0, 9999.0,    0.0],
    [   0.0,    0.0,    0.0,    0.0,    0.0, 9999.0],
  ]), 
  "starting P matrix =", 
  ["x", "y", "vx", "vy", "ax", "ay"], 
  ["x", "y", "vx", "vy", "ax", "ay"], 
  inputsDiv, false
);
const rMatrixElement = new NumericalTableElement(
  new Matrix([
    [100, 0],
    [0, 100]
  ]), 
  "R matrix =", ["x", "y"], ["x", "y"], inputsDiv, false
);
const fMatrixElement = new NumericalTableElement(
  new Matrix([
    [1, 0, 1, 0, 1/2,   0],
    [0, 1, 0, 1,   0, 1/2],
    [0, 0, 1, 0,   1,   0],
    [0, 0, 0, 1,   0,   1],
    [0, 0, 0, 0,   1,   0],
    [0, 0, 0, 0,   0,   1],
  ]), 
  "F matrix =", 
  ["x", "y", "vx", "vy", "ax", "ay"], 
  ["x", "y", "vx", "vy", "ax", "ay"], 
  inputsDiv, true 
);
new NumericalTableElement(
  new Matrix([
    [1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
  ]), 
  "H matrix =", 
  ["x", "y"], 
  ["x", "y", "vx", "vy", "ax", "ay"], 
  inputsDiv, true 
);
new NumericalTableElement(
  new Matrix([
    [0.0], // x
    [0.0], // y
    [0.0], // vx
    [0.0], // vy
    [0.0], // ax
    [0.0], // ay
  ]),
  "U matrix =", ["x", "y", "vx", "vy", "ax", "ay"], [""], inputsDiv, true 
);

// Initialize the renderer, event handler, and controller
const renderer = new Renderer("drawing-surface");
const eventHandler = new EventHandler(renderer);
const controller = new Controller(eventHandler);

// Initialze the KF and scene
const dt = 1 / 60;
const kalmanFilter = new KalmanFilter(dt, 
  sensorDtElement, pMatrixElement, rMatrixElement, xMatrixElement, fMatrixElement);
const scene = new Scene(renderer, eventHandler, controller, dt, sensorDtElement, kalmanFilter,
  sensorNoiseElement);

// Create a scene manager and start the simulation
const sceneManager = new SceneManager(scene);
sceneManager.start();
