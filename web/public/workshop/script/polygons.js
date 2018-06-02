class Cube {
  constructor() {
    console.log( 'Constructor.' );

    // Data structures for analysis
    this.contours = null;

    // References
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    // Load sample image
    this.image = new Image( 640, 480 );
    this.image.addEventListener( 'load', evt => this.doImageLoad( evt ) );
    this.image.src = Cube.IMAGE_SOURCE;
  }

  // Visualize analysis
  draw( color, close = false ) {
    console.log( 'Drawing.' );

    // For each contour
    // Array of an array of point objects
    // [[{x, y}, {x, y}], [{x, y}, {x, y}], ...]
    for( let c = 0; c < this.contours.length; c++ ) {
      this.context.beginPath();
      this.context.lineWidth = 5;
      this.context.strokeStyle = color;      

      // For each point in the contour
      for( let p = 0; p < this.contours[c].length; p++ ) {
        if( p == 0 ) {
          this.context.moveTo( this.contours[c][p].x, this.contours[c][p].y );
        } else {
          this.context.lineTo( this.contours[c][p].x, this.contours[c][p].y );          
        }
      }

      // Optionally close for better visualization
      if( close ) {        
        this.context.closePath();
      }

      this.context.stroke();
    }
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

    // Dilate
    // Based on unmerged pull request
    // Two iterations for broader lines
    // jsfeat.imgproc.dilate( image, image );
    jsfeat.imgproc.dilate( image, image );

    // Render
    this.render( image, raw );

    // Interoperability
    // JSFeat uses columns and rows
    // CV uses width and height
    if( !image.width ) {
      image.width = image.cols;
      image.height = image.rows;
    }

    // Contours
    this.contours = CV.findContours( image, [] );
    this.draw( 'blue' );

    console.log( this.contours );

    // Polygons from contours
    for( let c = 0; c < this.contours.length; c++ ) {
      // Epsilon (variation) based on length of contour array      
      this.contours[c] = CV.approxPolyDP( this.contours[c], this.contours[c].length * 0.03 );      
    }

    this.draw( 'red', true );
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
Cube.IMAGE_SOURCE = 'img/rubiks.cube.jpg';

// Application
let app = new Cube();
