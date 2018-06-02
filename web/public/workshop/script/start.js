class Cube {
  constructor() {
    console.log( 'Constructor.' );

    // References
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    // Load sample image
    this.image = new Image( 640, 480 );
    this.image.addEventListener( 'load', evt => this.doImageLoad( evt ) );
    this.image.src = Cube.IMAGE_SOURCE;
  }

  // Image processing
  detect() {
    console.log( 'Detect.' );

    // Shortcuts 
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.image, 0, 0, width, height );
  }

  // Image loaded
  doImageLoad( evt ) {
    console.log( 'Image loaded.' );

    // Process image
    this.detect();
  }
}

// Constants
Cube.IMAGE_SOURCE = 'img/rubiks.cube.jpg';

// Application
let app = new Cube();
