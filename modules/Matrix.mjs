class Matrix {
  static empty() {
    return new Matrix([[]])
  }

  static zeros(rows, cols) {
    return Matrix.full(rows, cols, 0);
  }
  
  static ones(rows, cols) {
    return Matrix.full(rows, cols, 1);
  }
  
  static full(rows, cols, x) {
    if (!Number.isInteger(rows) || rows < 0) {
      throw new Error("Argument 'rows' must be a positive integer");
    }

    if (!Number.isInteger(cols) || cols < 0) {
      throw new Error("Argument 'cols' must be a positive integer");
    }

    if (rows === 0 && cols === 0) {
      return Matrix.empty();
    }

    if (rows === 0) {
      throw new Error("The Matrix of shape '0 x m' does not exist")
    }

    if (cols === 0) {
      throw new Error("The Matrix of shape 'n x 0' does not exist")
    }
    
    const m = [];
    for (let r = 0; r < rows; r += 1) {
      m.push([]);
      for (let c = 0; c < cols; c += 1) {
        m[r].push(x);
      }
    }

    return new Matrix(m);
  }
  
  static identity(n) {
    const m = Matrix.zeros(n, n);
    
    for (let r = 0; r < n; r += 1) {
      m._[r][r] = 1;
    }

    return m;
  }

  #data;
  #r;
  #c;

  constructor(data) {
    const parameterTypeError = "Parameter is not of type [[number]]";
    if (!Array.isArray(data) || data.length < 1) {
      throw new Error(parameterTypeError);
    }
    
    data.forEach(row => {
      if (!Array.isArray(row)) {
        throw new Error(parameterTypeError);
      }
      
      if (this.#c === undefined) {
        this.#c = row.length;
      }
      else if (this.#c !== row.length) {
        throw new Error("Row lengths are not consistent");
      }

      row.forEach(n => {
        if (isNaN(n)) {
          throw new Error(parameterTypeError);
        }
      });
    })

    if (data.length === 1 && data[0].length === 0) {
      this.#r = 0;
    }
    else {
      this.#r = data.length;
    }

    this.#data = data;
  }
  
  get shape() {
    return [this.#r, this.#c];
  }
  
  get _() {
    return this.#data;
  }

  get T() {
    const newData = [];

    for (let c = 0; c < this.#c; c += 1) {
      newData.push([]);
      for (let r = 0; r < this.#r; r += 1)
      {
        newData[c][r] = this._[r][c];
      }
    }

    return new Matrix(newData);
  }
  
  get isSquare() {
    return this.#r === this.#c;
  }

  add(x) {
    if (x.__proto__.constructor.name !== "Matrix") {
      throw new Error("Argument is not a Matrix");
    }

    if (x.shape[0] !== this.shape[0] || x.shape[1] !== this.shape[1]) {
      throw new Error("Matrices being added should have the same shape");
    }

    if (this.#r === 0 && this.#c === 0) {
      return Matrix.empty();
    }

    return Matrix.#forEach(this, x, (n1, n2) => n1 + n2);
  }
  
  sub(x) {
    if (x.__proto__.constructor.name !== "Matrix") {
      throw new Error("Argument is not a Matrix");
    }

    if (x.shape[0] !== this.shape[0] || x.shape[1] !== this.shape[1]) {
      throw new Error("Matrices being subtracted should have the same shape");
    }

    if (this.#r === 0 && this.#c === 0) {
      return Matrix.empty();
    }

    return Matrix.#forEach(this, x, (n1, n2) => n1 - n2);
  }

  static #forEach(m1, m2, cb) {
    const newData = [];
      
    for (let r = 0; r < m1.#r; r += 1) {
      newData.push([]);
      for (let c = 0; c < m2.#c; c += 1) {
        newData[r][c] = cb(m1._[r][c], m2._[r][c]);
      } 
    }

    return new Matrix(newData);
  }
  
  mul(x) {
    switch (x.__proto__.constructor.name) {
      case "Number":
      {
        const newMatrix = new Matrix(this._.map((r) => [...r]))
        for (let r = 0; r < this.#r; r += 1) {
          for (let c = 0; c < this.#c; c += 1) {
            newMatrix._[r][c] *= x;
          }
        }
        return newMatrix;
      }
      case "Matrix":
      {
        if (this.#c !== x.#r) {
          throw new Error("1st Matrix columns don't match 2nd Matrix rows");
        }

        if (this.#c === 0 && x.#r === 0) {
          return Matrix.empty();
        }

        const newData = [];
        
        for (let r = 0; r < this.#r; r += 1) {
          newData.push([]);
          for (let c = 0; c < x.#c; c += 1) {
            newData[r][c] = 0;
            for (let i = 0; i < this.#c; i += 1) {
              newData[r][c] += this._[r][i] * x._[i][c];
            }
          }
        }

        return new Matrix(newData);
      }
      default:
        throw new Error("Not a valid argument type for Matrix.mult()");
    }
  }

  det() {
    if (!this.isSquare) {
      throw new Error("Can't take the determinant of a non-square matrix");
    }

    if (this.#r === 0) {
      return 1;
    }

    if (this.#r === 1) {
      return this._[0][0];
    }

    if (this.#r === 2) {
      return (this._[0][0] * this._[1][1]) - (this._[0][1] * this._[1][0]);
    }
    
    // Laplace Expansion
    let sum = 0;
    const bottomRows = this._.slice(1);
    for (let c = 0; c < this.#c; c += 1) {
      const subMatrix = new Matrix(bottomRows.map(r => [... r.slice(0,c), ... r.slice(c+1)]));
      const sign = Math.pow(-1, c % 2);
      sum += sign * this._[0][c] * subMatrix.det();
    }
    return sum;
  }

  inv() {
    if (!this.isSquare) {
      throw new Error("Can't take the inverse of a non-square matrix");
    }
    
    if (this.#r === 0) {
      return Matrix.empty();
    }

    const det = this.det();
    if (det === 0) {
      throw new Error("Can't take the inverse of a 'Singular' matrix");
    }
    
    if (this.#r === 1) {
      return new Matrix([[1 / det]]);
    }

    // Matrix of minors, cofactors, and adjugate
    const m = Matrix.zeros(this.#r, this.#c);
    for (let r = 0; r < this.#r; r += 1) {
      let sign = Math.pow(-1, r);
      for (let c = 0; c < this.#c; c += 1) {
        m._[c][r] = new Matrix(
          [... this._.slice(0,r), ... this._.slice(r+1)]
          .map(row => [... row.slice(0,c), ... row.slice(c+1)])
          ).det() * sign;
        sign *= -1;
      }
    }

    return m.mul(1 / det);
  }

  isEqual(m) {
    return !Matrix.#any(this, m, (n1, n2) => n1 !== n2);
  }

  static #any(m1, m2, cb) {
      
    for (let r = 0; r < m1.#r; r += 1) {
      for (let c = 0; c < m2.#c; c += 1) {
        if (cb(m1._[r][c], m2._[r][c])) {
          return true;
        }
      } 
    }

    return false;
  }

  copy() {
    return new Matrix(this._.slice(0, this.#r).map(r => r.slice(0, this.#c)));
  }
  
  toString() {
    if (this.#r === 0 && this.#c === 0) return "[[]]";

    // Get the max characters for numbers in a column
    // to use for padding and alignment
    const colMaxChars = [];
    for (let r = 0; r < this.#r; r += 1) {
      for (let c = 0; c < this.#c; c += 1) {
        const n = this._[r][c].toString().length;
        if (colMaxChars[c] === undefined || n > colMaxChars[c]) {
          colMaxChars[c] = n;
        }
      }
    }

    // Create a valid JSON string with one line
    // per row and number padding and alignment
    let s = "";
    for (let r = 0; r < this.#r; r += 1) {
      if (r === 0) {
        s += "[[ ";
      }
      else {
        s += " [ ";
      }
      for (let c = 0; c < this.#c; c += 1) {
        const n = this._[r][c].toString();
        const pad = colMaxChars[c] - n.length;
        for (let p = 0; p < pad; p += 1) {
          s += " ";
        }
        s += n;
        if (c !== this.#c - 1) {
          s += " , ";
        }
        else {
          s += " ]";
        }
      }
      if (r !== this.#r - 1) {
        s += ",\n";
      }
      else {
        s += "]";
      }
    }
    
    return s;
  }
}

export { Matrix }
