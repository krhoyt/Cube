class Solver {
  constructor() {
    // Pre-build solve tables    
    Cube.initSolver( '/lib/cubejs/worker.js' );

    this.camera = new Camera();
    this.camera.addEventListener( Camera.EVENT_COLORS, ( evt ) => this.doColors( evt ) );

    this.scramble = new Scramble();
    this.scramble.addEventListener( Scramble.EVENT_FILLED, ( evt ) => this.doFilled( evt ) );

    this.controls = new Controls();
    this.controls.addEventListener( Controls.EVENT_CAPTURE, ( evt ) => this.doCapture( evt ) );
  }

  doCapture( evt ) {
    this.camera.capture();    
  }

  doColors( evt ) {
    console.log( evt );
    this.scramble.push( evt );
  }

  doFilled( evt ) {
    console.log( evt );

    let centers = [];
    let sides = [];

    // Center colors
    for( let e = 0; e < evt.length; e++ ) {
      centers.push( evt[e][4] );
    }

    console.log( centers );

    // Each side
    for( let e = 0; e < evt.length; e++ ) {
      let side = '';

      // Each cubie
      for( let i = 0; i < evt[e].length; i++ ) {        
        let closest = {
          distance: null,
          index: null
        };
          
        // Each center color
        for( let c = 0; c < centers.length; c++ ) {
          let distance = deltaE( centers[c], evt[e][i] );
          
          if( closest.distance === null ) {
            closest.distance = distance;
            closest.index = c;
          } else {
            if( closest.distance > distance ) {
              closest.distance = distance;
              closest.index = c;
            }
          }
        }

        // Set color based closest to center
        evt[e][i] = centers[closest.index];
        side = side + closest.index;
      }

      sides.push( side )
    }

    console.log( sides );

    let state = sides[4] + sides[1] + sides[0] + sides[5] + sides[3] + sides[2];

    console.log( state );
    state = state.replace( new RegExp( '4', 'g' ), 'U' );      
    state = state.replace( new RegExp( '1', 'g' ), 'R' );      
    state = state.replace( new RegExp( '0', 'g' ), 'F' );      
    state = state.replace( new RegExp( '5', 'g' ), 'D' );      
    state = state.replace( new RegExp( '3', 'g' ), 'L' );      
    state = state.replace( new RegExp( '2', 'g' ), 'B' );
    console.log( state );

    let shuffle = Cube.fromString( state );  
    let algorithm = shuffle.solve();
    
    // this.solution.innerHTML = algorithm;
    // this.solution.style.display = 'block';

    console.log( algorithm );               

    // Refresh cube state
    // Using center-matched colors
    this.scramble.state = evt;
  }
}

let app  = new Solver();
