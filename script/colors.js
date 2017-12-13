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
    // Shortcuts
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.camera, 0, 0, width, height );

    // Get pixels
    // [red, green, blue, alpha, ...]
    let raw = this.context.getImageData( 0, 0, width, height );

    // Look through the pixels
    for( let p = 0; p < raw.data.length; p += 4 ) {
      // Convert RGB to HSB
      let hsb = this.rgb2hsb( raw.data[p], raw.data[p + 1], raw.data[p + 2] );

      // Check hue in range
      // Make black if in range
      if( hsb.hue >= 230 && hsb.hue <= 250 ) {
        raw.data[p] = 0;
        raw.data[p + 1] = 0;
        raw.data[p + 2] = 0;        
      }

      /*
      // Check blue in range
      // Make black if in range
      if( raw.data[p + 2] >= 230 && raw.data[p + 2] <= 255 ) {
        raw.data[p] = 0;
        raw.data[p + 1] = 0;
        raw.data[p + 2] = 0;
      }
      */
    }

    // Put edited pixels back onto canvas
    this.context.putImageData( raw, 0, 0 );

    // Continuous analysis
    requestAnimationFrame( () => { return this.detect(); } );    
  }

  // Convert RGB to HSB
  // https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
  rgb2hsb( red, green, blue ) {
    red /= 255; 
    green /= 255; 
    blue /= 255;

    let minimum = Math.min( red, green, blue );
    let maximum = Math.max( red, green, blue );
    let delta = maximum - minimum;
    let hsb = {
      hue: 0, 
      saturation: 0, 
      brightness: maximum
    };

    if( delta !== 0 ) {
      hsb.saturation = delta / maximum;
      let dred = ( ( ( maximum - red ) / 6 ) + ( delta / 2 ) ) / delta;
      let dgreen = ( ( ( maximum - green ) / 6 ) + ( delta / 2 ) ) / delta;
      let dblue = ( ( ( maximum - blue ) / 6 ) + ( delta / 2 ) ) / delta;

      if( red === maximum ) {
        hsb.hue = dblue - dgreen;
      } else if( green === maximum ) {
        hsb.hue = ( 1 / 3 ) + dred - dblue;
      } else if( blue === maximum ) {
        hsb.hue = ( 2 / 3 ) + dgreen - dred;
      }

      if( hsb.hue < 0 ) {
        hsb.hue += 1;
      }

      if( hsb.hue > 1 ) {
        hsb.hue -= 1;
      }
    }

    hsb.hue *= 360;
    hsb.saturation *= 100;
    hsb.brightness *= 100;

    return hsb;    
  }
}

// Constants
Cube.ANGLE_VARIATION = 20;
Cube.IMAGE_VARIATION = 0.25;
Cube.MEDIAN_MINIMUM = 0.50;
Cube.MEDIAN_MAXIMUM = 2;
Cube.ROTATION_VARIATION = 10;
Cube.SIDE_VARIATION = 0.60;

// Application
let app = new Cube();
