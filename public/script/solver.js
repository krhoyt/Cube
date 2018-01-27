class Solver {
  constructor() {
    // Mobile or desktop
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false;     

    // Desktop hooks
    if( !this.touch ) {
      document.addEventListener( 'keyup', ( evt ) => this.doKeyUp( evt ) );
    }

    // Camera
    this.camera = new Camera();
    this.camera.start();

    // Cube
    this.cube = new Cubicle();

    // Load color palette
    fetch( 'data/' + Solver.PALETTE )
      .then( ( response ) => { 
        // Parse JSON
        return response.json() 
      } )
      .then( ( data ) => {
        // Assign palette
        // Build cube
        this.cube.palette = data;
        this.cube.colorize( Cubicle.FRONT, 'ZZZZGZZZZ' );
        this.cube.colorize( Cubicle.RIGHT, 'ZZZZRZZZZ' );
        this.cube.colorize( Cubicle.BACK, 'ZZZZBZZZZ' );        
        this.cube.colorize( Cubicle.LEFT, 'ZZZZOZZZZ' );        
        this.cube.colorize( Cubicle.UP, 'ZZZZWZZZZ' );        
        this.cube.colorize( Cubicle.DOWN, 'ZZZZYZZZZ' );        

        // Reference colors
        this.camera.palette = data;
        this.camera.addEventListener( Camera.ANALYZE, ( evt ) => this.doAnalyze( evt ) );
      } );        
  }

  // Camera analysis complete
  // Populate other components
  doAnalyze( evt ) {
    this.cube.colorize( Cubicle.FRONT, evt );
  }

  doKeyUp( evt ) {
    // Space bar
    // Capture
    if( evt.keyCode == 32 ) {
      this.camera.analyze();
    }

    // Letter (R)
    // Reset
    if( evt.keyCode == 82 ) {
      this.camera.reset();
    }
  }
}

Solver.PALETTE = 'palette.json';

let app = new Solver();
