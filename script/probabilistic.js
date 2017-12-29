class Cube {
  constructor() {
    // Data structures for analysis
    this.lines = [];

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
    // Shortcuts
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.camera, 0, 0, width, height );

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
    
    // Render
    this.render( image, raw );

    // Hough
    // Image, Rho, Theta, Threshold
    // this.lines = jsfeat.imgproc.hough_transform( image, 1, Math.PI / 180, 95 );
    this.lines = probabilisticHoughTransform( image.data, width, height, 1, Math.PI / 180, 65, 95, 50, 100 );
    // dst, lines, 1, CV_PI/180, 50, 50, 10 
    // edgeImg, colCount, rowCount, rho, theta, threshold, lineLength, lineGap, linesMax   

    // Visualize
    this.draw( 'green' );

    // Continuous analysis
    requestAnimationFrame( () => { return this.detect(); } );    
  }

  // Visualize analysis
  draw( color, close = false ) {
    for( let h = 0; h < this.lines.length; h++ ) {
      this.context.beginPath();
      this.context.moveTo( this.lines[h][0].x, this.lines[h][0].y );
      this.context.lineWidth = 2;
      this.context.strokeStyle = color;
      this.context.lineTo( this.lines[h][1].x, this.lines[h][1].y );
      this.context.stroke();      
    }

    /*
    // Draw Hough lines
    // Ported from OpenCV documentation
    for( let h = 0; h < this.lines.length; h++ ) {
      let a = Math.cos( this.lines[h][1] );
      let b = Math.sin( this.lines[h][1] );
      let x0 = a * this.lines[h][0];
      let y0 = b * this.lines[h][0];
      let x1 = x0 + this.canvas.width * ( 0 - b );
      let y1 = y0 + this.canvas.width * a;
      let x2 = x0 - this.canvas.width * ( 0 - b );
      let y2 = y0 - this.canvas.width * a;

      this.context.beginPath();
      this.context.moveTo( x1, y1 );
      this.context.lineWidth = 2;
      this.context.strokeStyle = color;
      this.context.lineTo( x2, y2 );
      this.context.stroke();
    } 
    */   
  }

  render( source, destination ) {
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
}

// Application
let app = new Cube();
