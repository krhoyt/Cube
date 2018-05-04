class Solver {
  constructor() {
    this.camera = new Camera();
    this.scramble = new Scramble();

    this.controls = new Controls();
    this.controls.addEventListener( Controls.EVENT_CAPTURE, ( evt ) => this.doCapture( evt ) );
  }

  doCapture( evt ) {
    this.camera.capture();    
  }
}

let app  = new Solver();
