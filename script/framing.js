class Cube {
  constructor() {
    this.mean = null;

    // References
    this.camera = document.querySelector( 'video' );    
    this.canvas = document.querySelector( 'canvas' );
    this.canvas.addEventListener( 'click', evt => this.doSample( evt ) );
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
          height: Cube.SAMPLING_SIZE,
          red: 0,
          green: 0,
          blue: 0
        } );
      }    
    }

    // Get color reference
    fetch( '/data/traditional.json' )
      .then( ( results ) => { return results.json() } )
      .then( ( data ) => {
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
      this.swatches[s].red = Math.round( mean.red / ( this.swatches[s].width * this.swatches[s].height ) );
      this.swatches[s].green = Math.round( mean.green / ( this.swatches[s].width * this.swatches[s].height ) );
      this.swatches[s].blue = Math.round( mean.blue / ( this.swatches[s].width * this.swatches[s].height ) );            

      // Draw averaged colors on screen
      this.context.strokeStyle = 'green';
      this.context.fillStyle = 
        'rgb( ' + 
        this.swatches[s].red + 
        ', ' + 
        this.swatches[s].green + 
        ', ' + 
        this.swatches[s].blue + 
        ' )';
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

  rgb2hsb( red, green, blue ) {
    let minimum =  Math.min( red, green, blue );
    let maximum = Math.max( red, green, blue );
    let delta = maximum - minimum;
    let hue = maximum;
    let saturation = maximum;
    let brightness = maximum;

    brightness = Math.floor( maximum / 255 * 100 );
    
    if( maximum != 0 ) {
      saturation = Math.floor( delta / maximum * 100 );
    } else {
      hue = 0;
      saturation = 0;
      brightness = 0;
    }

    if( red == maximum ) {
      hue = ( green - blue ) / delta;
    } else if( green == maximum ) {
      hue = 2 + ( blue - red ) / delta;
    } else {
      hue = 4 + ( red - green ) / delta;
    }
      
    hue = Math.floor( hue * 60 );
    
    if( hue < 0 ) {
      hue += 360;
    } 

    return {
      hue: hue,
      saturation: saturation,
      brightness: brightness
    };
  }

  doSample( evt ) {
    let face = '';

    console.log( this.swatches );

    for( let s = 0; s < this.swatches.length; s++ ) {
      let hsb = this.rgb2hsb( 
        this.swatches[s].red,
        this.swatches[s].green,
        this.swatches[s].blue 
      );

      console.log( hsb );

      for( let c = 0; c < this.colors.length; c++ ) {
        if( 
          ( hsb.hue > ( this.colors[c].hue - Cube.COLOR_VARIANCE ) ) && ( hsb.hue < ( this.colors[c].hue + Cube.COLOR_VARIANCE ) )
        ) {
          face = face + this.colors[c].short;
          break;
        }
      }
    }

    console.log( face );
  }
}

// Constants
Cube.COLOR_VARIANCE = 20;
Cube.SAMPLING_SIZE = 25;
Cube.SAMPLING_SPACE = 60;

// Application
let app = new Cube();
