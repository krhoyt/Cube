class Cube {
  constructor() {
    // Found color clusters
    this.clusters = [];

    // References
    this.camera = document.querySelector( 'video' );    
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    // Load sampled colors
    fetch( Cube.COLORS, {
      method: 'GET'
    } ).then( ( response ) => {
      return response.json();
    } ).then( ( data ) => {
      let colors = [];
      for( let c = 0; c < data.length; c++ ) {
        // Colors to track
        colors.push( data[c].name );

        // Register color comparisons
        tracking.ColorTracker.registerColor( data[c].name, ( r, g, b ) => {  
          var dx = r - data[c].red;
          var dy = g - data[c].green;
          var dz = b - data[c].blue;
  
          // if( ( b - g ) >= 100 && ( r - g ) >= 60 ) {
          if( r < 50 && g > 200 && b < 50 ) {            
            return true;
          }
          
          return dx * dx + dy * dy + dz * dz < 3500;
        } );
      }

      // Color tracking
      this.tracker = new tracking.ColorTracker( colors );
      this.tracker.setMinDimension( Cube.DIMENSION_MINIMUM );    
      this.tracker.on( 'track', evt => this.doColors( evt ) );    

      // Access web camera
      // Start detection
      navigator.mediaDevices.getUserMedia( {audio: false, video: true} )
        .then( ( stream ) => {
          this.camera.srcObject = stream;
          this.camera.onloadedmetadata = function( evt ) {
            this.camera.play();
            
            // Start visualization
            this.render();

            // Start looking for colors
            tracking.track( this.camera, this.tracker );
          }.bind( this );
        } ).catch( ( error ) => {
          console.log( error );
        } );      
    } ).catch( ( error ) => {
      console.log( error );
    } );
  }

  render() {
    // Draw video onto canvas
    this.context.drawImage( this.camera, 0, 0, 640, 480 );

    // Roughly equal sides
    this.clusters = this.clusters.reduce( ( matches, cluster ) => {
      let ratio = cluster.width / cluster.height;

      if( ratio > ( 1 - Cube.RATIO_VARIATION ) && ratio < ( 1 + Cube.RATIO_VARIATION )  ) {
        matches.push( cluster );
      }

      return matches;
    }, [] );

    // Get areas of clusters
    let areas = [];
    let remove = [];

    for( let c = 0; c < this.clusters.length; c++ ) {
      areas.push( this.clusters[c].width * this.clusters[c].height );
    }

    // Median area (square size)
    let median = areas.reduce( ( total, area ) => {
      return total + area;
    }, 0 );
    median = median / this.clusters.length;

    // Remove areas smaller than median
    // Remove areas larger than median
    // Remove areas larger than portion of image
    for( let c = 0; c < this.clusters.length; c++ ) {
      let area = this.clusters[c].width * this.clusters[c].height;
      if( ( area < ( median * Cube.MEDIAN_MINIMUM ) ) ||
          ( area > ( median * Cube.MEDIAN_MAXIMUM ) ) ||
          ( area > ( ( this.canvas.width * this.canvas.height ) * Cube.IMAGE_VARIATION ) ) ) {
        remove.push( c );
      }
    }

    // Remove non-matching dimensions
    for( let r = 0; r < remove.length; r++ ) {
      this.clusters.splice( remove[r] - r, 1 );
    }

    // Remaining clusters
    for( let c = 0; c < this.clusters.length; c++ ) {
      this.context.beginPath();
      this.context.lineWidth = 5;
      this.context.strokeStyle = this.clusters[c].color;
      this.context.strokeRect( 
        this.clusters[c].x, 
        this.clusters[c].y, 
        this.clusters[c].width, 
        this.clusters[c].height 
      );      
    }

    // Continuously render
    requestAnimationFrame( () => { return this.render(); } );        
  }

  doColors( evt ) {
    if( evt.data.length === 0 ) {
      this.clusters = [];
    } else {
      this.clusters = evt.data.slice( 0 );
    }
  }
}

Cube.COLORS = '../data/pastel.json';
Cube.DIMENSION_MINIMUM = 40;
Cube.MEDIAN_MINIMUM = 0.50;
Cube.MEDIAN_MAXIMUM = 2;
Cube.RATIO_VARIATION = 0.10;

// Application
let app = new Cube();
