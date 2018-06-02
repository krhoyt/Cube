class Solver {
  constructor() {
    // Pre-build solve tables    
    Cube.initSolver( '/lib/cubejs/worker.js' );

    this.camera = new Camera();
    this.camera.addEventListener( Camera.EVENT_COLORS, ( evt ) => this.doColors( evt ) );

    this.scramble = new Scramble();
    this.scramble.addEventListener( Scramble.EVENT_FILLED, ( evt ) => this.doFilled( evt ) );

    this.controls = new Controls();
    this.controls.addEventListener( Controls.EVENT_MORE, ( evt ) => this.doMore( evt ) );
    this.controls.addEventListener( Controls.EVENT_CAPTURE, ( evt ) => this.doCapture( evt ) );
    this.controls.addEventListener( Controls.EVENT_CLEAR, ( evt ) => this.doClear( evt ) );    

    this.solution = document.querySelector( '#solution' );
  }

  doCapture( evt ) {
    this.camera.capture();    
  }

  doClear( evt ) {
    this.solution.style.display = 'none';
    this.solution.style.innerHTML = '';

    this.scramble.clear();
  }

  doColors( evt ) {
    console.log( evt );
    this.scramble.push( evt );
  }

  doFilled( evt ) {
    let centers = [];
    let sides = [];

    // Center colors
    for( let e = 0; e < evt.length; e++ ) {
      centers.push( evt[e][4] );
    }

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

    // Place in order needed by solver
    let state = sides[4] + sides[1] + sides[0] + sides[5] + sides[3] + sides[2];

    // Convert to notation needed by solver
    state = state.replace( new RegExp( '4', 'g' ), 'U' );      
    state = state.replace( new RegExp( '1', 'g' ), 'R' );      
    state = state.replace( new RegExp( '0', 'g' ), 'F' );      
    state = state.replace( new RegExp( '5', 'g' ), 'D' );      
    state = state.replace( new RegExp( '3', 'g' ), 'L' );      
    state = state.replace( new RegExp( '2', 'g' ), 'B' );

    // Solve
    let shuffle = Cube.fromString( state );  
    let algorithm = shuffle.solve();

    // Display
    console.log( algorithm );               
    this.solution.innerHTML = algorithm;
    this.solution.style.display = 'block';

    // Refresh cube state
    // Using center-matched colors
    this.scramble.state = evt;
  }

  doMore( evt ) {
    document.location = 'https://twitter.com/krhoyt';
  }
}

let app  = new Solver();
