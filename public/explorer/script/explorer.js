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

    this.solution = document.querySelector( '#camera > .solution' );
  }

  doCapture( evt ) {
    this.scramble.side( evt );
  }

  doComplete( evt ) {
    if( this.camera.mode >= Camera.MODE_DISTANCE ) {
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

      if( this.camera.mode === Camera.MODE_SOLVE ) {
        // Order sides
        let local = [];
        local.push( evt[4] );
        local.push( evt[1] );
        local.push( evt[0] );
        local.push( evt[5] );
        local.push( evt[3] );
        local.push( evt[2] );

        // Make state string
        let value = '';

        for( let s = 0; s < local.length; s++ ) {
          for( let f = 0; f < local[s].length; f++ ) {
            value = value + local[s][f].index;
          }
        }

        // Replace index with side indicator
        value = value.replace( new RegExp( '4', 'g' ), 'U' );      
        value = value.replace( new RegExp( '1', 'g' ), 'R' );      
        value = value.replace( new RegExp( '0', 'g' ), 'F' );      
        value = value.replace( new RegExp( '5', 'g' ), 'D' );      
        value = value.replace( new RegExp( '3', 'g' ), 'L' );      
        value = value.replace( new RegExp( '2', 'g' ), 'B' ); 

        console.log( value );

        // Solve
        let shuffle = Cube.fromString( value );  
        let algorithm = shuffle.solve();
        
        this.solution.innerHTML = algorithm;
        this.solution.style.display = 'block';

        console.log( algorithm );           
      }

    } else {
      console.log( evt );      
    }
  }

  doKey( evt ) {
    if( evt.keyCode == 99 || evt.keyCode == 67 ) {
      this.solution.style.display = 'none';
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
      this.solution.style.display = 'none';
      this.scramble.hide();
    }
  }
}

Explorer.COLOR_RAW = 16;
Explorer.COLOR_DISTANCE = 17;

// Application entry point
let app = new Explorer();
