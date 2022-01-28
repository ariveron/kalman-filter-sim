class SceneManager {
  #scene;
  #lastUpdateTime;
  #lag;

  constructor(scene) {
    this.#scene = scene;
    this.#lastUpdateTime = 0;
    this.#lag = 0;
  }
  
  start() {
    const handleFrame = (now) => {
      this.#lag += (now - this.#lastUpdateTime) / 1000;
      this.#lastUpdateTime = now;

      while (this.#lag > this.#scene.dt) {
        try {
          this.#scene.update();
        } catch (error) {
          console.error(error);
        }
        this.#lag -= this.#scene.dt;
      }

      try {
        this.#scene.draw();
      } catch (error) {
        console.error(error);
      }
      
      window.requestAnimationFrame(handleFrame);
    };
    window.requestAnimationFrame(handleFrame);
  }
}

export { SceneManager }
