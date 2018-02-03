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
    fetch( '../data/palette.json' )
      .then( ( response ) => { return response.json() } )
      .then( ( data ) => {
        console.log( 'Palette loaded.' );

        // Reference
        this.palette = data;

        // Load image
        this.image.src = Cube.IMAGE_SOURCE;        
      } );
  }

  // Image processing
  detect() {
    console.log( 'Detect.' );

    // Shortcuts 
    let width = this.canvas.width;
    let height = this.canvas.height;

    // Put image onto canvas
    this.context.drawImage( this.image, 0, 0, width, height );
  }

  doChange( evt ) {
    console.log( evt );
  }

  // Image loaded
  doImageLoad( evt ) {
    console.log( 'Image loaded.' );

    this.ants.bounds( 
      ( window.innerWidth - this.canvas.width ) / 2,
      ( window.innerHeight - this.canvas.height ) / 2,
      this.canvas.width,
      this.canvas.height
    )
    this.ants.show();

    // Process image
    this.detect();
  }
}

// Constants
Cube.IMAGE_SOURCE = 'img/rubiks.cube.jpg';

// Application
let app = new Cube();
