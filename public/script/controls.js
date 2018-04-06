class Controls extends Observer {
  constructor( path = '#controls' ) {
    super();

    this.root = document.querySelector( path );
    
    this.shutter = this.root.querySelector( '#shutter' );
    this.shutter.addEventListener( 'touchstart', ( evt ) => this.doShutter( evt ) );

    this.reset = this.root.querySelector( '#reset' );
    this.reset.addEventListener( 'touchstart', ( evt ) => this.doReset( evt ) );
  }

  doReset( evt ) {
    this.emit( Controls.RESET, null );
  }

  doShutter( evt ) {
    this.emit( Controls.SHUTTER, null );
  }
}

Controls.RESET = 'reset_event';
Controls.SHUTTER = 'shutter_event';
