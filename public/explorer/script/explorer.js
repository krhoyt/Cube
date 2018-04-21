class Explorer {
  constructor() {
    // Pre-build solve tables    
    Cube.initSolver( '/lib/cubejs/worker.js' );

    // Removable events
    this.doKey = this.doKey.bind( this );    

    // Components
    this.menu = new Menu( '#menu' );
    this.menu.addEventListener( Menu.ITEM_SELECTED, ( evt ) => this.doMenuItem( evt ) );

    this.camera = new Camera( '#camera' );
    this.camera.addEventListener( Camera.EVENT_COLORS, ( evt ) => this.doColors( evt ) );
    this.camera.start();

    this.scramble = new Scramble( '#scramble' );
    this.scramble.addEventListener( Scramble.EVENT_READY, ( evt ) => this.doReady( evt ) );
  }

  doColors( evt ) {
    this.scramble.side( evt );
  }

  doKey( evt ) {
    console.log( evt );

    if( evt.keyCode === 32 || evt.keyCode === 160 ) {
      if( this.camera.isTracking() ) {
        if( evt.keyCode === 32 ) {
          this.camera.capture();
        } else if( evt.keyCode === 160 ) {
          this.camera.capture( true );
        } else {
          console.log( 'Unknown command.' );
        }
      } else {
        console.log( 'Not tracking.' );
      }
    }    
  }

  // Menu item selected
  doMenuItem( evt ) {
    // Debug
    console.log( evt );

    // Set camera mode
    this.camera.mode = evt;

    if( evt >= Explorer.COLOR_DISTANCE ) {
      if( !this.scramble.isVisible() ) {
        document.body.addEventListener( 'keypress', this.doKey );
      }

      this.scramble.show();
    } else {
      document.body.removeEventListener( 'keypress', this.dKey );
      this.scramble.hide();
    }
  }

  doReady( evt ) {
    let colors = ['U', 'R', 'F', 'D', 'L', 'B'];
    let state = '';

    for( let c = 0; c < evt.length; c++ ) {
      for( let s = 0; s < this.camera.swatches.length; s++ ) {
        let color = this.camera.swatches[s];
        let compare = `rgb(${color.red}, ${color.green}, ${color.blue})`;

        if( evt[c] === compare ) {
          state = state + s;
          break;
        }
      }
    }

    for( let c = 0; c < colors.length; c++ ) {
      state = state.replace( new RegExp( c.toString(), 'g' ), colors[c] );
    }

    console.log( state );
    console.log( 'Ready to solve.' );

    let shuffle = Cube.fromString( state );  
    // console.log( shuffle.toJSON() );
    // let algorithm = shuffle.solve();
    // console.log( algorithm );    
  }
}

Explorer.COLOR_DISTANCE = 16;

// Application entry point
let app = new Explorer();
