class Controls {
  constructor( path = '#controls' ) {
    this.listeners = [];

    this.root = document.querySelector( path );
    
    this.shutter = this.root.querySelector( '#shutter' );
    this.shutter.addEventListener( 'touchstart', ( evt ) => this.doShutter( evt ) );

    this.reset = this.root.querySelector( '#reset' );
    this.reset.addEventListener( 'touchstart', ( evt ) => this.doReset( evt ) );
  }

  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
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
