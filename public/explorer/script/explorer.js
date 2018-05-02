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
    this.camera.addEventListener( Camera.EVENT_CAPTURE, ( evt ) => this.doCapture( evt ) );
    this.camera.start();

    this.scramble = new Scramble( '#scramble' );
    this.scramble.addEventListener( Scramble.EVENT_COMPLETE, ( evt ) => this.doComplete( evt ) );
  }

  doCapture( evt ) {
    this.scramble.side( evt );
  }

  doComplete( evt ) {
    if( this.camera.mode === Camera.MODE_DISTANCE ) {
      let swatches = [];

      for( let s = 0; s < evt.length; s++ ) {
        swatches.push( evt[s][4] );
      }

      for( let side = 0; side < evt.length; side++ ) {
        for( let face = 0; face < evt[side].length; face++ ) {
          let closest = {
            distance: 1000,
            index: 1000,
            color: null
          };

          for( let color = 0; color < swatches.length; color++ ) {
            let distance = deltaE( swatches[color], evt[side][face] );

            if( distance < closest.distance ) {
              closest.distance = distance;
              closest.index = color;
              closest.color = swatches[color];
            }
          }

          evt[side][face] = closest.color;
          evt[side][face].index = closest.index;
        }
      }

      console.log( evt );

      this.scramble.state = evt;
    }

    /*
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

    // let shuffle = Cube.fromString( state );  
    // console.log( shuffle.toJSON() );
    // let algorithm = shuffle.solve();
    // console.log( algorithm );    
    */
  }

  doKey( evt ) {
    if( evt.keyCode == 99 || evt.keyCode == 67 ) {
      this.scramble.clear();
    }

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
    // Set camera mode
    this.camera.mode = evt;

    if( evt >= Explorer.COLOR_RAW ) {
      if( !this.scramble.isVisible() ) {
        document.body.addEventListener( 'keypress', this.doKey );
      }

      this.scramble.clear();
      this.scramble.show();
    } else {
      document.body.removeEventListener( 'keypress', this.dKey );
      this.scramble.hide();
    }
  }
}

Explorer.COLOR_RAW = 16;
Explorer.COLOR_DISTANCE = 17;

// Application entry point
let app = new Explorer();
