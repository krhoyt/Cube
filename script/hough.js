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

    // Hold processed image data
    // Matrix format typically used for image processing
    // [rgba, rgba, ...]
    let image = new jsfeat.matrix_t( width, height, jsfeat.U8_t | jsfeat.C1_t );

    // Make grayscale
    jsfeat.imgproc.grayscale( raw.data, width, height, image, jsfeat.COLOR_RGBA2GRAY );    

    // Gaussian blur
    // 3 x 3
    let kernel = ( 3 + 1 ) << 1;
    jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );

    // Canny
    jsfeat.imgproc.canny( image, image, 20, 40 );

    // Hough
    // Image, Rho, Theta, Threshold
    let hough = jsfeat.imgproc.hough_transform( image, 1, Math.PI / 180, 115 );
    console.log( hough );
    
    // Render
    this.render( image, raw );

    // Draw Hough lines
    // Ported from OpenCV documentation
    for( let h = 0; h < hough.length; h++ ) {
      let a = Math.cos( hough[h][1] );
      let b = Math.sin( hough[h][1] );
      let x0 = a * hough[h][0];
      let y0 = b * hough[h][0];
      let x1 = x0 + this.canvas.width * ( 0 - b );
      let y1 = y0 + this.canvas.width * a;
      let x2 = x0 - this.canvas.width * ( 0 - b );
      let y2 = y0 - this.canvas.width * a;

      console.log( hough[h][1] * ( 180 / Math.PI ) );
      let degrees = hough[h][1] * ( 180 / Math.PI );

      if( ( degrees > 87 && degrees < 93 ) ||
          ( degrees > 177 && degrees < 180 ) || 
          ( degrees > 0 && degrees < 3 ) ) {
            this.context.beginPath();
            this.context.moveTo( x1, y1 );
            this.context.lineWidth = 2;
            this.context.strokeStyle = 'green';
            this.context.lineTo( x2, y2 );
            this.context.stroke();
      }


    }
  }

  render( source, destination ) {
    console.log( 'Render.' );

    // From matrix to image data
    let alpha = ( 0xff << 24 );
    let data = new Uint32Array( destination.data.buffer );    
    let i = source.cols * source.rows
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
Cube.IMAGE_SOURCE = 'img/rounded.cube.jpg';

// Application
let app = new Cube();
