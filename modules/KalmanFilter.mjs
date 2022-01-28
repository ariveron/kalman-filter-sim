import { Matrix } from "./Matrix.mjs"

class KalmanFilter {
  #xs;
  #ps;
  #u;
  #f;
  #fT;
  #h;
  #hT;
  #r;
  #identity;
  #initialXElement;
  #initialPElement;
  #dt;
  #sensorDtElement;
  #rMatrixElement;
  #fMatrixElement;

  constructor(dt, sensorDtElement, pMatrixElement, rMatrixElement, xMatrixElement, fMatrixElement) {
    this.#dt = dt;
    this.#sensorDtElement = sensorDtElement;
    this.#xs = {};
    this.#ps = {};
    this.#u = new Matrix([
      [0.0], // x
      [0.0], // y
      [0.0], // vx
      [0.0], // vy
      [0.0], // ax
      [0.0], // ay
    ]);
    this.#f = this.#createFMatrix(sensorDtElement.value * dt);
    this.#fT = this.#f.T;
    this.#h = new Matrix([
      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
    ]);
    this.#hT = this.#h.T;
    this.#rMatrixElement = rMatrixElement;
    this.#r = rMatrixElement.value;
    this.#identity = Matrix.identity(6);
    this.#initialXElement = xMatrixElement;
    this.#initialPElement = pMatrixElement;
    this.#fMatrixElement = fMatrixElement;
    this.#fMatrixElement.value = this.#f;
  }

  #createFMatrix(dt) {
    return new Matrix([
      [1,0,dt, 0,dt*dt/2,      0],
      [0,1, 0,dt,      0,dt*dt/2],
      [0,0, 1, 0,     dt,      0],
      [0,0, 0, 1,      0,     dt],
      [0,0, 0, 0,      1,      0],
      [0,0, 0, 0,      0,      1],
    ]);
  }
  
  startTracking(ids) {
    ids.forEach(id => {
      this.#xs[id] = this.#initialXElement.value.copy();
      this.#ps[id] = this.#initialPElement.value.copy();
    });
  }

  stopTracking(ids) {
    ids.forEach(id => {
      delete this.#xs[id];
      delete this.#ps[id];
    });
  }

  updateAndPredict(measurements) {
    this.#f = this.#createFMatrix(this.#sensorDtElement.value * this.#dt);
    this.#fT = this.#f.T;
    if (!this.#fMatrixElement.value.isEqual(this.#f)) {
      this.#fMatrixElement.value = this.#f;
    }
    this.#r = this.#rMatrixElement.value;

    return measurements.map(([id, mX, mY]) => {
      let x = this.#xs[id];
      let p = this.#ps[id];
      
      // predict
      x = this.#f.mul(x).add(this.#u);
      p = this.#f.mul(p.mul(this.#fT));
      
      // update
      const z = new Matrix([
        [mX],
        [mY],
      ]);
      const y = z.sub(this.#h.mul(x));
      const s = this.#h.mul(p.mul(this.#hT)).add(this.#r);
      const k = p.mul(this.#hT.mul(s.inv()));
      x = x.add(k.mul(y));
      p = this.#identity.sub(k.mul(this.#h)).mul(p);
      
      this.#xs[id] = x;
      this.#ps[id] = p;

      return [id, x._[0][0], x._[1][0], p._[0][0], p._[1][1]];
    });
  }
}

export { KalmanFilter }