class Cube {
  constructor() {
    // References
    this.camera = document.querySelector( 'video' );    
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    // Sampling areas
    this.swatches = [];
    
    // Center vertically and horizontally
    let offset_x = ( this.canvas.width - ( ( Cube.SAMPLING_SIZE * 5 ) + ( Cube.SAMPLING_SPACE * 2 ) ) ) / 2;
    let offset_y = ( this.canvas.height - ( ( Cube.SAMPLING_SIZE * 5 ) + ( Cube.SAMPLING_SPACE * 2 ) ) ) / 2;

    // Build sampling swatches
    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        // |-- 25 --[ 25 ]-- 60 --[ 25 ]-- 60 --[ 25 ] -- 25 --|
        this.swatches.push( {
          x: Cube.SAMPLING_SIZE + ( r * ( Cube.SAMPLING_SIZE + Cube.SAMPLING_SPACE ) ) + offset_x,
          y: Cube.SAMPLING_SIZE + ( c * ( Cube.SAMPLING_SIZE + Cube.SAMPLING_SPACE ) ) + offset_y,
          width: Cube.SAMPLING_SIZE,
          height: Cube.SAMPLING_SIZE
        } );
      }    
    }
    
    // Access web camera
    // Start detection
    navigator.mediaDevices.getUserMedia( {audio: false, video: true} )
      .then( ( stream ) => {
        this.camera.srcObject = stream;
        this.camera.onloadedmetadata = function( evt ) {
          this.camera.play();
          this.detect();
        }.bind( this );
      } ).catch( ( error ) => {
        console.log( error );
      } );
  }

  // Image processing
  detect() {
    // Shortcuts
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.camera, 0, 0, width, height );

    // Get pixels
    // [red, green, blue, alpha, ...]
    let raw = this.context.getImageData( 0, 0, width, height );

    for( let s = 0; s < this.swatches.length; s++ ) {
      this.context.fillRect( 
        this.swatches[s].x,
        this.swatches[s].y,
        this.swatches[s].width,
        this.swatches[s].height
      );
    }

    // Continuous analysis
    requestAnimationFrame( () => { return this.detect(); } );    
  }
}

// Constants
Cube.SAMPLING_SIZE = 25;
Cube.SAMPLING_SPACE = 60;

// Application
let app = new Cube();
