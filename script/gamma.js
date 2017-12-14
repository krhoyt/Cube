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

    // Get pixels
    // [red, green, blue, alpha, ...]
    let raw = this.context.getImageData( 0, 0, width, height );

    // Apply filter
    raw = this.gamma( raw );

    // Put edited pixels back onto canvas
    this.context.putImageData( raw, 0, 0 );    
  }

  // Gamma (contrast) adjustment
  // Intentionally naive to demonstrate pixel manipulation
  gamma( image, adjust = 2 ) {
    // Iterate through the pixels
    // Adjusting by gamma value along the way
    for( let p = 0; p < image.data.length; p += 4 ) {    
      image.data[p] = 255 * Math.pow( image.data[p] / 255, 1 / adjust );
      image.data[p + 1] = 255 * Math.pow( image.data[p + 1] / 255, 1 / adjust );      
      image.data[p + 2] = 255 * Math.pow( image.data[p + 2] / 255, 1 / adjust );      
    }

    return image;
  }

  // Image loaded
  doImageLoad( evt ) {
    console.log( 'Image loaded.' );

    // Process image
    this.detect();
  }
}

// Constants
Cube.GAMMA = 1 / 2;
Cube.IMAGE_SOURCE = 'img/rubiks.cube.jpg';

// Application
let app = new Cube();
