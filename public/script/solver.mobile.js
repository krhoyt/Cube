class Solver {
  constructor() {
    this.camera = new Camera();
    this.camera.addEventListener( Camera.EVENT_COLORS, ( evt ) => this.doColors( evt ) );

    this.scramble = new Scramble();

    this.controls = new Controls();
    this.controls.addEventListener( Controls.EVENT_CAPTURE, ( evt ) => this.doCapture( evt ) );
  }

  doCapture( evt ) {
    this.camera.capture();    
  }

  doColors( evt ) {
    console.log( evt );
    /*
    this.scramble.colors = evt;
    this.scramble.rotate();
    */
  }
}

let app  = new Solver();
