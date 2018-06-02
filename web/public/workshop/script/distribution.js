class Cube {
  constructor() {
    console.log( 'Constructor.' );

    // Colors
    this.palette = null;
    
    // Sample marquee
    this.ants = new Ants();
    this.ants.addEventListener( Ants.CHANGE, ( evt ) => this.doChange( evt ) );

    // References
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    // Sample image reference
    this.image = new Image( 640, 480 );
    this.image.addEventListener( 'load', evt => this.doImageLoad( evt ) );

    // Load color palette
    fetch( Cube.PALETTE_SOURCE )
      .then( ( response ) => { return response.json() } )
      .then( ( data ) => {
        console.log( 'Palette loaded.' );

        // Reference
        this.palette = data;

        // Load image
        this.image.src = Cube.IMAGE_SOURCE;        
      } );
  }

  doChange( evt ) {
    // Grab raw pixels
    let pixels = this.context.getImageData( evt.x, evt.y, evt.width, evt.height );
    
    // Track closest match
    let closest = null;

    // Track statistical distribution
    let distribution = {R: 0, G: 0, B: 0, Y: 0, O: 0, W: 0};

    // Look through specified pixels
    for( let p = 0; p < pixels.data.length; p++ ) {
      // Get the RGB pixels
      let rgb = {
        red: pixels.data[( p * 4 )],            
        green: pixels.data[( p * 4 ) + 1],
        blue: pixels.data[( p * 4 ) + 2]
      };

      // Convert to Lab
      let lab = rgb2lab( rgb );         

      // Look through color palette
      for( let color in this.palette.sides ) {
        // let distance = deltaE( this.palette.sides[color], lab );
        let distance = ciede2000( this.palette.sides[color], lab );

        // First iteration
        if( closest == null ) {
          closest = {
            distance: distance,
            color: color,
            source: lab
          };
        } else {
          // Better match than what we have
          if( closest.distance > distance ) {
            closest.distance = distance;
            closest.color = color;
            closest.source = lab;
          }
        }
      }

      // Increment distribution
      // 25w * 25h * 4rgba = 2500 
      distribution[closest.color] += 1;
    }

    console.log( closest );
    console.log( distribution );
  }

  // Image loaded
  doImageLoad( evt ) {
    console.log( 'Image loaded.' );

    // Position ants on canvas
    this.ants.bounds( 
      ( window.innerWidth - this.canvas.width ) / 2,
      ( window.innerHeight - this.canvas.height ) / 2,
      this.canvas.width,
      this.canvas.height
    )
    this.ants.show();

    // Put image onto canvas
    this.context.drawImage( 
      this.image, 
      0, 
      0, 
      this.canvas.width, 
      this.canvas.height 
    );
  }
}

// Constants
// Cube.IMAGE_SOURCE = 'img/rubiks.cube.jpg';
// Cube.IMAGE_SOURCE = 'img/rubiks.colors.jpg';
Cube.IMAGE_SOURCE = 'img/rounded.cube.jpg';
Cube.PALETTE_SOURCE = '../data/palette.json';

// Application
let app = new Cube();
