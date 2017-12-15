class Cube {
  constructor() {
    this.mean = null;

    // References
    this.camera = document.querySelector( 'video' );    
    this.canvas = document.querySelector( 'canvas' );
    this.canvas.addEventListener( 'click', ( evt ) => {
      console.log( this.mean );
    } );
    this.context = this.canvas.getContext( '2d' );

    // Sampling areas
    this.swatches = [];
    
    // Color comparisons
    this.colors = [];

    // Center vertically and horizontally
    let offset_x = ( this.canvas.width - ( ( Cube.SAMPLING_SIZE * 5 ) + ( Cube.SAMPLING_SPACE * 2 ) ) ) / 2;
    let offset_y = ( this.canvas.height - ( ( Cube.SAMPLING_SIZE * 5 ) + ( Cube.SAMPLING_SPACE * 2 ) ) ) / 2;

    // Build sampling swatches
    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        // |-- 25 --[ 25 ]-- 60 --[ 25 ]-- 60 --[ 25 ] -- 25 --|
        this.swatches.push( {
          x: Cube.SAMPLING_SIZE + ( r * ( Cube.SAMPLING_SIZE + Cube.SAMPLING_SPACE ) ) + Math.round( offset_x ),
          y: Cube.SAMPLING_SIZE + ( c * ( Cube.SAMPLING_SIZE + Cube.SAMPLING_SPACE ) ) + Math.round( offset_y ),
          width: Cube.SAMPLING_SIZE,
          height: Cube.SAMPLING_SIZE
        } );
      }    
    }

    // Get color reference
    fetch( '/data/traditional.json' )
      .then( ( results ) => { return results.json() } )
      .then( ( data ) => {
        // Convert to XYZ color space
        for( let c = 0; c < data.length; c++ ) {
          rgb2lab( data[c] );
        }

        // Store colors
        // Get camera
        this.colors = data.slice( 0 );
        return navigator.mediaDevices.getUserMedia( {audio: false, video: true} );
      } ).then( ( stream ) => {
        // Use camera as video stream
        this.camera.srcObject = stream;
        this.camera.onloadedmetadata = function( evt ) {
          // Play stream
          // Start analysis
          this.camera.play();
          this.detect();
        }.bind( this );
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

    // Look through swatch areas
    for( let s = 0; s < this.swatches.length; s++ ) {
      let mean = {
        count: 0,
        red: 0,
        green: 0,
        blue: 0
      };

      // Sum the RGB values for the related pixels
      for( let y = this.swatches[s].y; y < this.swatches[s].y + this.swatches[s].height; y++ ) {
        for( let x = this.swatches[s].x; x < this.swatches[s].x + this.swatches[s].width; x++ ) {
          mean.red = mean.red + raw.data[( y * width * 4 ) + ( x * 4 )];
          mean.green = mean.green + raw.data[( y * width * 4 ) + ( x * 4 ) + 1];
          mean.blue = mean.blue + raw.data[( y * width * 4 ) + ( x * 4 ) + 2];                    
        }
      }

      // Average a single RGB value for the entire swatch
      mean.red = Math.round( mean.red / ( this.swatches[s].width * this.swatches[s].height ) );
      mean.green = Math.round( mean.green / ( this.swatches[s].width * this.swatches[s].height ) );
      mean.blue = Math.round( mean.blue / ( this.swatches[s].width * this.swatches[s].height ) );            
      
      // Look for a color match
      for( let c = 0; c < this.colors.length; c++ ) {
        // Get LAB value of RGB average
        // Measure the color distance
        this.mean = rgb2lab( mean );
        let distance = deltaE( this.colors[c], this.mean );        

        // Match
        if( distance < 0.70 ) {
          console.log( this.colors[c].short );
        }
      }

      this.context.strokeStyle = 'green';
      this.context.fillStyle = 'rgb( ' + mean.red + ', ' + mean.green + ', ' + mean.blue + ' )';
      this.context.fillRect( 
        this.swatches[s].x,
        this.swatches[s].y,
        this.swatches[s].width,
        this.swatches[s].height
      );
      this.context.beginPath();
      this.context.rect(
        this.swatches[s].x,
        this.swatches[s].y,
        this.swatches[s].width,
        this.swatches[s].height
      );
      this.context.closePath();
      this.context.stroke();
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
