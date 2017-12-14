class Cube {
  constructor() {
    // References
    this.camera = document.querySelector( 'video' );    
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

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
    // console.log( 'Detect.' );

    // Shortcuts
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.camera, 0, 0, width, height );

    // Get pixels
    // [red, green, blue, alpha, ...]
    let raw = this.context.getImageData( 0, 0, width, height );

    // Put back on canvas
    this.context.putImageData( destination, 0, 0 );    

    // Continuous analysis
    requestAnimationFrame( () => { return this.detect(); } );    
  }
}

// Application
let app = new Cube();
