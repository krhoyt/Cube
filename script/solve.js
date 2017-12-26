class Cubed {
  constructor() {
    // Pre-build solve tables
    Cube.initSolver( '/lib/cubejs/worker.js' );

    // Current cube state
    // 0 - Front
    // 1 - Right
    // 2 - Back
    // 3 - Left
    // 4 - Up
    // 5 - Down
    this.state = [];

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
    let offset_x = ( this.canvas.width - ( ( Cubed.SAMPLING_SIZE * 5 ) + ( Cubed.SAMPLING_SPACE * 2 ) ) ) / 2;
    let offset_y = ( this.canvas.height - ( ( Cubed.SAMPLING_SIZE * 5 ) + ( Cubed.SAMPLING_SPACE * 2 ) ) ) / 2;

    // Build sampling swatches
    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        // |-- 25 --[ 25 ]-- 60 --[ 25 ]-- 60 --[ 25 ] -- 25 --|
        this.swatches.push( {
          x: Cubed.SAMPLING_SIZE + ( c * ( Cubed.SAMPLING_SIZE + Cubed.SAMPLING_SPACE ) ) + Math.round( offset_x ),
          y: Cubed.SAMPLING_SIZE + ( r * ( Cubed.SAMPLING_SIZE + Cubed.SAMPLING_SPACE ) ) + Math.round( offset_y ),
          width: Cubed.SAMPLING_SIZE,
          height: Cubed.SAMPLING_SIZE,
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
      let closest = null;

      // Get the color distances for each pixel in the swatch
      for( let y = this.swatches[s].y; y < this.swatches[s].y + this.swatches[s].height; y++ ) {
        for( let x = this.swatches[s].x; x < this.swatches[s].x + this.swatches[s].width; x++ ) {
          let lab = rgb2lab( {
            red: raw.data[( y * width * 4 ) + ( x * 4 )],            
            green: raw.data[( y * width * 4 ) + ( x * 4 ) + 1],
            blue: raw.data[( y * width * 4 ) + ( x * 4 ) + 2]
          } );      

          for( let c = 0; c < this.colors.length; c++ ) {
            let distance = deltaE( this.colors[c], lab );

            if( closest == null ) {
              closest = {
                distance: distance,
                color: this.colors[c],
                source: lab
              };
            } else {
              if( closest.distance > distance ) {
                closest.distance = distance;
                closest.color = this.colors[c];
                closest.source = lab;
              }
            }
          }
        }
      }

      this.swatches[s].closest = closest;

      // Draw averaged colors on screen
      this.context.strokeStyle = 'green';
      this.context.fillStyle = 
        'rgb( ' + 
        closest.color.red + 
        ', ' + 
        closest.color.green + 
        ', ' + 
        closest.color.blue + 
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

  doSample( evt ) {
    let face = '';

    for( let s = 0; s < this.swatches.length; s++ ) {
      face = face + this.swatches[s].closest.color.face;
    }

    console.log( face );

    this.state.push( face );

    if( this.state.length == 6 ) {
      console.log( this.state[4] + this.state[1] + this.state[0] + this.state[5] + this.state[3] + this.state[2] );
      /*
      let shuffle = Cube.fromString(
        this.state[4] + this.state[1] + this.state[0] + this.state[5] + this.state[3] + this.state[2]
      );  
      let algorithm = shuffle.solve();
      console.log( algorithm );
      */
    }
  }
}

// Constants
Cubed.SAMPLING_SIZE = 25;
Cubed.SAMPLING_SPACE = 60;

// Application
let app = new Cubed();
