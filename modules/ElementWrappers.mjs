class NumericalScalarElement {
  static #nextId = 0;
  static #prefix = "numerical-scalar-element-";
  
  #id;
  #value;
  #parentDiv;
  #inputElement;
  #isInt;

  constructor(value, label, rootElement, isInt) {
    this.#isInt = isInt;
    value = this.#isInt ? parseInt(value) : parseFloat(value);
    if (isNaN(value)) {
      throw new Error("Value is not a number");
    }
    this.#value = value;
    this.#id = NumericalScalarElement.#prefix + NumericalScalarElement.#nextId;
    NumericalScalarElement.#nextId += 1;

    const htmlStr = `
      <label for="${this.#id}">${label}</label>
      <input type="number" name="${this.#id}" id="${this.#id}" value="${this.#value}">
      <br>
    `;
    this.#parentDiv = document.createElement("div");
    this.#parentDiv.innerHTML = htmlStr;
    rootElement.appendChild(this.#parentDiv);
    this.#inputElement = document.getElementById(this.#id);
    
    this.#inputElement.addEventListener("change", (_) => {
      this.#value = this.#isInt 
        ? parseInt(this.#inputElement.value) : parseFloat(this.#inputElement.value);
      if (isNaN(this.#value)) {
        this.#value = 0;
      }
      this.#inputElement.value = this.#value;
    })
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    value = parseFloat(value);
    if (isNaN(value)) {
      throw new Error("Value is not a number");
    }
    this.#value = value;
    this.#inputElement.value = this.#value;
  }
}

class NumericalTableElement {
  static #nextId = 0;
  static #prefix = "numerical-table-element-";
  
  #id;
  #value;
  #parentDiv;
  #inputElement;

  constructor(value, label, rowLabels, colLabels, rootElement, readOnly) {
    if (value.__proto__.constructor.name !== "Matrix") {
      throw new Error("Value is not a Matrix");
    }
    this.#value = value;
    this.#id = NumericalTableElement.#prefix + NumericalTableElement.#nextId;
    NumericalTableElement.#nextId += 1;

    if (this.#value.shape[0] !== rowLabels.length || this.#value.shape[1] !== colLabels.length) {
      throw new Error("Matrix shape does not match row and column labels");
    }

    let htmlStr = `
      <label for="${this.#id}">${label}</label>
      <table id="${this.#id}">
        <tbody>
          <tr>
            <td></td>
    `;
    colLabels.forEach(colLabel => {
      htmlStr += `
            <td>${colLabel}</td> 
      `;
    });
    htmlStr += `
          </tr>
    `;
    for (let r = 0; r < this.#value.shape[0]; r += 1) {
      htmlStr += `
          <tr>
            <td>${rowLabels[r]}</td>
      `;
      for (let c = 0; c < this.#value.shape[1]; c += 1) {
        const cellId = `${this.#id}-${r}-${c}`;
        htmlStr += `
            <td><input 
              type="number" 
              id="${cellId}" 
              value="${this.#value._[r][c]}" 
              ${readOnly ? "readonly disabled" : ""}></td>
        `;
      }
      htmlStr += `
          </tr>
      `;
    }
    htmlStr += `
        </tbody>
      </table>
      <br>
    `

    this.#parentDiv = document.createElement("div");
    this.#parentDiv.innerHTML = htmlStr;
    rootElement.appendChild(this.#parentDiv);
    this.#inputElement = document.getElementById(this.#id);
    
    this.#inputElement.addEventListener("change", ev => {
      const [r, c] = ev.target.id.replace(this.#id + "-", "").split("-").map(n => parseFloat(n));
      let newVal = parseFloat(ev.target.value);
      if (isNaN(newVal)) newVal = 0;
      this.#value._[r][c] = newVal;
      this.#updateTableValue(r, c);
    });
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    if (value.__proto__.constructor.name !== "Matrix") {
      throw new Error("Value is not a Matrix");
    }
    if (this.#value.shape[0] !== value.shape[0] || this.#value.shape[1] !== value.shape[1]) {
      throw new Error("Value shape does not match Matrix shape");
    }
    this.#value = value;
    this.#updateAllTableValues();
  }

  #updateAllTableValues() {
    for (let r = 0; r < this.#value.shape[0]; r += 1) {
      for (let c = 0; c < this.#value.shape[1]; c += 1) {
        this.#updateTableValue(r, c);
      }
    }
  }

  #updateTableValue(r, c) {
    document.getElementById(`${this.#id}-${r}-${c}`).value = this.#value._[r][c];
  }
}

export { NumericalScalarElement , NumericalTableElement }