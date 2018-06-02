class Controls extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( '#controls' );
    this.more = this.root.querySelector( 'button:nth-of-type( 1 )' );
    this.more.addEventListener( 'touchstart', ( evt ) => this.doMore( evt ) );    
    this.capture = this.root.querySelector( 'button:nth-of-type( 2 )' );
    this.capture.addEventListener( 'touchstart', ( evt ) => this.doCapture( evt ) );
    this.clear = this.root.querySelector( 'button:nth-of-type( 3 )' );
    this.clear.addEventListener( 'touchstart', ( evt ) => this.doClear( evt ) );
  }

  doCapture( evt ) {
    this.emit( Controls.EVENT_CAPTURE, null );
  }

  doClear( evt ) {
    this.emit( Controls.EVENT_CLEAR, null );
  }

  doMore( evt ) {
    this.emit( Controls.EVENT_MORE, null );
  }  
}

Controls.EVENT_CAPTURE = 'controls_capture';
Controls.EVENT_CLEAR = 'controls_clear';
Controls.EVENT_MORE = 'controls_more';
