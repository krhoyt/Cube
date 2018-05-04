class Controls extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( '#controls' );
    this.capture = this.root.querySelector( 'button:nth-of-type( 2 )' );
    this.capture.addEventListener( 'touchstart', ( evt ) => this.doCapture( evt ) );
  }

  doCapture( evt ) {
    this.emit( Controls.EVENT_CAPTURE, null );
  }
}

Controls.EVENT_CAPTURE = 'controls_capture';
