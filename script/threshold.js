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

    // Hold results
    let gray = new CV.Image();
    let threshold = new CV.Image();
    let dilate = new CV.Image();

    // Grayscale
    CV.grayscale( raw, gray );

    // Threshold
    CV.adaptiveThreshold( gray, threshold, 2, 7 );    

    // Dilate
    CV.dilate( threshold, dilate );

    // Render
    this.render( dilate, raw );
  }

  render( source, destination ) {
    console.log( 'Render.' );

    // From matrix to image data
    let alpha = ( 0xff << 24 );
    let data = new Uint32Array( destination.data.buffer );    
    let i = source.width * source.height;
    let value = 0;
                    
    while( --i >= 0 ) {
      value = source.data[i];
      data[i] = alpha | ( value << 16 ) | ( value << 8 ) | value;
    }

    // Put back on canvas
    this.context.putImageData( destination, 0, 0 );
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
