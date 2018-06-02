class Prism {
  constructor() {
    // Reference colors
    this.palette = null;
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false;     

    // Reference to video
    this.video = document.querySelector( 'video' );

    // Canvas for analysis
    // Not visible
    this.canvas = document.createElement( 'canvas' );
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerWidth;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = window.innerWidth + 'px';
    document.body.appendChild( this.canvas );

    if( !this.touch ) {
      this.canvas.width = this.video.parentElement.clientWidth;
      this.canvas.height = this.video.parentElement.clientHeight;
    }

    this.context = this.canvas.getContext( '2d' );

    // Sampling areas
    this.swatches = [];    

    let square = this.canvas.width / 3;
    let space = square / 3;
    let left = 0;

    if( !this.touch ) {
      left = Math.round( ( this.video.parentElement.clientWidth - this.video.parentElement.clientHeight ) / 2 );
      square = this.canvas.height / 3;
      space = square / 3;
    }

    // Build sampling swatches
    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        let x = left + Math.round( ( c * square ) + ( ( square - space ) / 2 ) );
        let y = Math.round( ( r * square ) + ( ( square - space ) / 2 ) );

        this.swatches.push( {
          x: x,
          y: y,
          width: Math.round( space ),
          height: Math.round( space )
        } );
      }    
    }    
  }

  analyze() {
    // Put pixels on canvas
    this.context.drawImage( 
      this.video, 
      0, 
      0, 
      window.innerWidth, 
      window.innerWidth, 
      0, 
      0, 
      window.innerWidth, 
      window.innerWidth 
    );

    // Get pixels from canvas
    let pixels = this.context.getImageData( 
      0, 
      0, 
      window.innerWidth, 
      window.innerWidth 
    );

    // Result string
    let result = '';

    // Examine swatches
    for( let s = 0; s < this.swatches.length; s++ ) {
      let closest = null;

      // Get the color distances for each pixel in the swatch
      for( let y = this.swatches[s].y; y < this.swatches[s].y + this.swatches[s].height; y++ ) {
        for( let x = this.swatches[s].x; x < this.swatches[s].x + this.swatches[s].width; x++ ) {
          let rgb = {
            red: pixels.data[( y * window.innerWidth * 4 ) + ( x * 4 )],            
            green: pixels.data[( y * window.innerWidth * 4 ) + ( x * 4 ) + 1],
            blue: pixels.data[( y * window.innerWidth * 4 ) + ( x * 4 ) + 2]
          };
          let lab = rgb2lab( rgb );      

          for( let color in this.palette.sides ) {
            let distance = deltaE( this.palette.sides[color], lab );

            if( closest == null ) {
              closest = {
                distance: distance,
                color: color,
                source: lab
              };
            } else {
              if( closest.distance > distance ) {
                closest.distance = distance;
                closest.color = color;
                closest.source = lab;
              }
            }
          }
        }
      }

      result = result + closest.color;
    }

    return result;
  }
}
