class Explorer {
  constructor() {
    // Removable events
    this.doKey = this.doKey.bind( this );    

    // Components
    this.menu = new Menu( '#menu' );
    this.menu.addEventListener( Menu.ITEM_SELECTED, ( evt ) => this.doMenuItem( evt ) );

    this.camera = new Camera( '#camera' );
    this.camera.addEventListener( Camera.EVENT_COLORS, ( evt ) => this.doColors( evt ) );
    this.camera.start();

    this.cube = new Cube( '#cube' );
  }

  doColors( evt ) {
    this.cube.side( [
      'red', 'green', 'orange',
      'red', 'blue', 'yellow',
      'white', 'blue', 'yellow'
    ] );
  }

  doKey( evt ) {
    if( evt.keyCode === 32 ) {
      this.camera.capture();
    }    
  }

  // Menu item selected
  doMenuItem( evt ) {
    // Debug
    console.log( evt );

    // Set camera mode
    this.camera.mode = evt;

    if( evt >= Explorer.COLOR_DISTANCE ) {
      if( !this.cube.isVisible() ) {
        document.body.addEventListener( 'keypress', this.doKey );
      }

      this.cube.show();
    } else {
      document.body.removeEventListener( 'keypress', this.dKey );
      this.cube.hide();
    }
  }
}

Explorer.COLOR_DISTANCE = 16;

// Application entry point
let app = new Explorer();
