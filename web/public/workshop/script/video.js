class Cube {
  constructor() {
    // console.log( 'Constructor.' );

    // Data structures for analysis
    this.contours = null;
    this.squares = [];

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

  // Corners should be (roughly) ninety (90) degrees
  // Exact square is 0, 90, -180, -90
  angles( polygon ) {
    let corners = [];
    let variations = [0, 90, 180, 90];

    // Get angles
    corners.push( Math.atan2( polygon[1].y - polygon[0].y, polygon[1].x - polygon[0].x ) * ( 180 / Math.PI ) );
    corners.push( Math.atan2( polygon[2].y - polygon[1].y, polygon[2].x - polygon[1].x ) * ( 180 / Math.PI ) );
    corners.push( Math.atan2( polygon[3].y - polygon[2].y, polygon[3].x - polygon[2].x ) * ( 180 / Math.PI ) );        
    corners.push( Math.atan2( polygon[0].y - polygon[3].y, polygon[0].x - polygon[3].x ) * ( 180 / Math.PI ) );    

    // Check if within acceptable range
    for( let c = 0; c < corners.length; c++ ) {
      if( ( Math.abs( corners[c] ) < ( variations[c] - Cube.ANGLE_VARIATION ) ) ||
          ( Math.abs( corners[c] ) > ( variations[c] + Cube.ANGLE_VARIATION ) ) ) {
        return false;
      }
    }

    // This is a square
    return true;
  }

  // Determine area of polygon (square)
  // Use top side and right side
  area( polygon ) {
    let width = this.distance( polygon[0], polygon[1] );
    let height = this.distance( polygon[1], polygon[2] ); 
    return width * height;
  }

  // Image processing
  detect() {
    // console.log( 'Detect.' );

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

    // console.log( this.contours );

    // Polygons from contours
    for( let c = 0; c < this.contours.length; c++ ) {
      // Epsilon (variation) based on length of contour array
      this.contours[c] = CV.approxPolyDP( this.contours[c], this.contours[c].length * 0.02 );      
    }

    this.draw( 'red', true );

    let remove = [];

    // Find squares
    for( let c = 0; c < this.contours.length; c++ ) {
      // Squares have four corners
      if( this.contours[c].length != 4 ) {
        remove.push( c );
        continue;
      }

      // Order points
      // Top-left, top-right, bottom-right, bottom-left
      this.contours[c] = this.order( this.contours[c] ).splice( 0 );

      // Squares have (roughly) equal length sides
      if( !this.measure( this.contours[c] ) ) {
        remove.push( c );
        continue;
      }

      // Squares have (roughly) ninety (90) degree angles
      if( !this.angles( this.contours[c] ) ) {
        remove.push( c );
        continue;
      }

      // Squares in cube will have minimal rotation
      // Checking one side will do
      let rotation = Math.atan2( this.contours[c][1].y - this.contours[c][0].y, this.contours[c][1].x -  this.contours[c][0].x ) * ( 180 / Math.PI );
      if( rotation > ( 0 + Cube.ROTATION_VARIATION ) || 
          rotation < ( 0 - Cube.ROTATION_VARIATION ) ) {
        remove.push( c );
        continue;
      }
    }

    // Remove non-squares
    for( let r = 0; r < remove.length; r++ ) {
      this.contours.splice( remove[r] - r, 1 );
    }

    // Get areas of remaining squares
    let areas = [];
    remove = [];

    for( let c = 0; c < this.contours.length; c++ ) {
      areas.push( this.area( this.contours[c] ) );
    }

    // Median area (square size)
    let median = areas.reduce( ( total, area ) => {
      return total + area;
    }, 0 );
    median = median / this.contours.length;

    // console.log( median );

    // Remove squares smaller than median
    // Remove squares larger than median
    // Remove squares larger than portion of image
    for( let c = 0; c < this.contours.length; c++ ) {
      let area = this.area( this.contours[c] );
      if( ( area < ( median * Cube.MEDIAN_MINIMUM ) ) ||
          ( area > ( median * Cube.MEDIAN_MAXIMUM ) ) ||
          ( area > ( ( width * height ) * Cube.IMAGE_VARIATION ) ) ) {
        remove.push( c );
      }
    }

    // Remove non-matching dimensions
    for( let r = 0; r < remove.length; r++ ) {
      this.contours.splice( remove[r] - r, 1 );
    }

    // Overlapping squares
    // Usually in the case of outer and inner squares
    // Common around the edge of pieces
    remove = [];

    for( let c = 0; c < this.contours.length; c++ ) {
      let result = false;

      if( c == ( this.contours.length - 1 ) ) {
        result = this.overlap( this.contours[c], this.contours[0] );
      } else {
        result = this.overlap( this.contours[c], this.contours[c + 1] );
      }

      if( result ) {
        remove.push( c );
      }
    }

    // Remove non-matching dimensions
    for( let r = 0; r < remove.length; r++ ) {
      this.contours.splice( remove[r] - r, 1 );
    }
    
    this.draw( 'yellow', true );    
    // console.log( this.contours );

    // Continuous analysis
    requestAnimationFrame( () => { return this.detect(); } );    
  }

  // Pythagorean theorum
  // Distance between two points
  distance( a, b ) {
    return Math.sqrt( Math.pow( b.x - a.x, 2 ) + Math.pow( b.y - a.y, 2 ) );
  }

  // Visualize analysis
  draw( color, close = false ) {
    // console.log( 'Drawing.' );

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

  // Look for (roughly) equal side lengths
  measure( polygon ) {
    let distances = [];

    // Calculate distance for each side
    distances.push( this.distance( polygon[0], polygon[1] ) );
    distances.push( this.distance( polygon[1], polygon[2] ) );
    distances.push( this.distance( polygon[2], polygon[3] ) );    
    distances.push( this.distance( polygon[3], polygon[0] ) );    

    // Find the longest of the sides
    // Apply amount of variation we are willing to tolerate
    let longest = Math.max( distances[0], distances[1], distances[2], distances[3] );
    let cutoff = longest * Cube.SIDE_VARIATION;

    // Check measured distances within tolerance      
    for( let d = 0; d < distances.length; d++ ) {
      if( distances[d] < cutoff ) {
        // Not a square
        return false;
      }
    }

    // Appears to be a square
    return true;
  }

  order( polygon ) {
    // http://webdevzoom.com/get-center-of-polygon-triangle-and-area-using-javascript-and-php/
    let center = polygon.reduce( ( reference, point ) => {
      return {
        x: reference.x + point.x / polygon.length, 
        y: reference.y + point.y / polygon.length
      };
    }, {x: 0, y: 0} );

    // Sort remainder by distance from top-left
    // https://stackoverflow.com/questions/242404/sort-four-points-in-clockwise-order
    polygon = polygon.sort( ( a, b ) => {
      let tana = Math.atan2( ( a.y - center.y ), ( a.x - center.x ) );
      let tanb = Math.atan2( ( b.y - center.y ), ( b.x - center.x ) );
      
      if( tana < tanb ) return -1;
      if( tanb < tana ) return 1;
      return 0;
    } );

    return polygon;
  }

  // Check for overlapping squares
  // https://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
  overlap( a, b ) {
    let result = false;

    // Add width and height properties
    // Used in overlap calculation
    // TODO: Refactor polygon
    // TODO: Reduce duplicate calls throughout
    a.width = this.distance( a[0], a[1] );
    a.height = this.distance( a[1], a[2] );

    b.width = this.distance( b[0], b[1] );
    b.height = this.distance( b[1], b[2] );    

    result = this.range( a[0].x, b[0].x, b[0].x + b.width ) || this.range( b[0].x, a[0].x, a[0].x + a.width );

    // Throw away only the larger square when overlapping
    if( result ) {
      if( this.area( a ) < this.area( b ) ) {
        result = false;
      }
    }

    return result;
  }

  range( value, minimum, maximum ) {
    return ( value >= minimum ) && ( value <= maximum );
  }

  render( source, destination ) {
    // console.log( 'Render.' );

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

// Constants
Cube.ANGLE_VARIATION = 20;
Cube.IMAGE_VARIATION = 0.25;
Cube.MEDIAN_MINIMUM = 0.50;
Cube.MEDIAN_MAXIMUM = 2;
Cube.ROTATION_VARIATION = 10;
Cube.SIDE_VARIATION = 0.60;

// Application
let app = new Cube();
