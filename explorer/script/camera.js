class Camera {
  constructor( path ) {
    this.mode = 0;

    this.root = document.querySelector( path );
    this.video = this.root.querySelector( 'video' );
    this.canvas = this.root.querySelector( 'canvas' );
    this.context = null;
  }

  analyze() {
    this.context.drawImage( this.video, 0, 0 );

    let contours = [];
    let image = new jsfeat.matrix_t( this.canvas.width, this.canvas.height, jsfeat.U8_t | jsfeat.C1_t );    
    let kernel = ( 3 + 1 ) << 1;          
    let pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height );
    
    switch( this.mode ) {
      case Camera.MODE_AVERAGED:
        this.averaged( pixels );
        break;

      case Camera.MODE_CANNY:
        jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );            
        jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
        jsfeat.imgproc.canny( image, image, 20, 40 );
        this.render( image, pixels );
        break;      

      case Camera.MODE_CONTOURS:
        jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );            
        jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
        jsfeat.imgproc.canny( image, image, 20, 40 );
        jsfeat.imgproc.dilate( image, image );

        // Interoperability
        // JSfeat uses columns and rows
        // CV uses width and height
        if( !image.width ) {
          image.width = image.cols;
          image.height = image.rows;
        }
    
        contours = CV.findContours( image, [] );
        this.render( image, pixels );
        break;


      case Camera.MODE_CONTRAST:
        this.contrast( pixels, 30 );
        break;

      case Camera.MODE_DILATE:
        jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );            
        jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
        jsfeat.imgproc.canny( image, image, 20, 40 );
        jsfeat.imgproc.dilate( image, image );        
        this.render( image, pixels );
        break;      

      case Camera.MODE_GAUSSIAN:
        jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );
        jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
        this.render( image, pixels );
        break;

      case Camera.MODE_POLYGONS:
      case Camera.MODE_SQUARES:
        jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );            
        jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
        jsfeat.imgproc.canny( image, image, 20, 40 );
        jsfeat.imgproc.dilate( image, image );

        // Interoperability
        // JSfeat uses columns and rows
        // CV uses width and height
        if( !image.width ) {
          image.width = image.cols;
          image.height = image.rows;
        }
    
        contours = CV.findContours( image, [] );
        this.render( image, pixels ); 
        break;     

      case Camera.MODE_THRESHOLD:
        let gray = new CV.Image();
        let threshold = new CV.Image();
        let dilate = new CV.Image();

        CV.grayscale( pixels, gray );
        CV.adaptiveThreshold( gray, threshold, 2, 7 );    
        CV.dilate( threshold, dilate );
        this.render( dilate, pixels );
        break;

      case Camera.MODE_WEIGHTED:
        this.weighted( pixels );
        break;
    }

    this.context.putImageData( pixels, 0, 0 );

    if( contours.length > 0 ) {
      this.draw( contours, 'blue', false );      

      if( this.mode === Camera.MODE_POLYGONS || this.mode === Camera.MODE_SQUARES ) {
        for( let c = 0; c < contours.length; c++ ) {
          // Epsilon (variation) based on length of contour array      
          contours[c] = CV.approxPolyDP( contours[c], contours[c].length * 0.03 );      
        }
  
        this.draw( contours, 'red', true );
      }

      if( this.mode === Camera.MODE_SQUARES ) {
        this.squares( contours );
        this.draw( contours, 'yellow', true );
      }
    }

    if( this.mode >= 1 ) {
      requestAnimationFrame( () => { return this.analyze(); } );          
    }
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
      if( ( Math.abs( corners[c] ) < ( variations[c] - Camera.VARIATION_ANGLE ) ) ||
          ( Math.abs( corners[c] ) > ( variations[c] + Camera.VARIATION_ANGLE ) ) ) {
        return false;
      }
    }

    // This is a square
    return true;
  }

  averaged( pixels ) {
    for( let p = 0; p < pixels.data.length; p += 4 ) {
      let average = ( 
        pixels.data[p] + 
        pixels.data[p + 1] + 
        pixels.data[p + 2] ) / 3;
    
      pixels.data[p] = average;
      pixels.data[p + 1] = average;
      pixels.data[p + 2] = average;
    }
  }

  contrast( pixels, amount ) {
    let factor = ( 259 * ( amount + 255 ) ) / ( 255 * ( 259 - amount ) );

    for( let p = 0; p < pixels.data.length; p += 4 ) {
      pixels.data[p] = factor * ( pixels.data[p] - 128 ) + 128;
      pixels.data[p + 1] = factor * ( pixels.data[p] - 128 ) + 128;      
      pixels.data[p + 2] = factor * ( pixels.data[p] - 128 ) + 128; 
    }
  }

  // Pythagorean theorum
  // Distance between two points
  distance( a, b ) {
    return Math.sqrt( Math.pow( b.x - a.x, 2 ) + Math.pow( b.y - a.y, 2 ) );
  }

  draw( contours, color, close = false  ) {
    for( let c = 0; c < contours.length; c++ ) {
      this.context.beginPath();
      this.context.lineWidth = 5;
      this.context.strokeStyle = color;      

      // For each point in the contour
      for( let p = 0; p < contours[c].length; p++ ) {
        if( p == 0 ) {
          this.context.moveTo( contours[c][p].x, contours[c][p].y );
        } else {
          this.context.lineTo( contours[c][p].x, contours[c][p].y );          
        }
      }

      // Optionally close for better visualization
      if( close ) {        
        this.context.closePath();
      }      

      this.context.stroke();
    }    
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
    let cutoff = longest * Camera.VARIATION_SIDE;

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

  weighted( pixels ) {
    for( let p = 0; p < pixels.data.length; p += 4 ) {
      let brightness = ( 
        ( 0.299 * pixels.data[p] ) + 
        ( 0.587 * pixels.data[p + 1] ) + 
        ( 0.114 * pixels.data[p + 2] ) );
    
      pixels.data[p] = brightness;
      pixels.data[p + 1] = brightness;
      pixels.data[p + 2] = brightness;
    }
  }

  setMode( value ) {
    this.mode = value;

    this.video.classList.remove( 'filtered' );

    switch( this.mode ) {
      case Camera.MODE_VIDEO:
        this.video.classList.remove( 'passive' );
        this.canvas.classList.add( 'passive' );    
        
        break;        

      case Camera.MODE_FILTERS:
        this.video.classList.remove( 'passive' );
        this.video.classList.add( 'filtered' );
        this.canvas.classList.add( 'passive' );
        break;

      case Camera.MODE_AVERAGED:
      case Camera.MODE_CANNY:
      case Camera.MODE_CONTOURS:
      case Camera.MODE_CONTRAST:
      case Camera.MODE_DILATE:
      case Camera.MODE_GAUSSIAN:
      case Camera.MODE_POLYGONS:
      case Camera.MODE_SQUARES:
      case Camera.MODE_THRESHOLD:
      case Camera.MODE_WEIGHTED:
        this.canvas.width = this.video.clientWidth;
        this.canvas.height = this.video.clientHeight;
        this.canvas.classList.remove( 'passive' );
        this.context = this.canvas.getContext( '2d' );

        this.video.classList.add( 'passive' );

        this.analyze();
        
        break;
    }
  }

  // From matrix to image data  
  render( source, destination ) {
    let alpha = ( 0xff << 24 );
    let data = new Uint32Array( destination.data.buffer );    
    let i = source.cols ? ( source.cols * source.rows ) : ( source.width * source.height );
    let value = 0;
                    
    while( --i >= 0 ) {
      value = source.data[i];
      data[i] = alpha | ( value << 16 ) | ( value << 8 ) | value;
    }
  }  

  start() {
    let video = true;

    // Get devices
    // Generally one (1) for desktop
    // Generally two (2) for mobile
    navigator.mediaDevices.enumerateDevices()
      .then( ( devices ) => {
        let count = 0;
        
        devices.forEach( ( device ) => {
          if( device.kind == 'videoinput' ) {
            count = count + 1;
          }
        } );

        // Default to desktop
        // Common mode for demos
        let video = true;

        // Go mobile if present
        if( count > 1 ) {
          video = {
            facingMode: {
              exact: 'environment'
            }
          }
        }

        // Get the video stream
        return  navigator.mediaDevices.getUserMedia( {
          audio: false, 
          video: video
        } );
      } )
      .then( ( stream ) => {
        // Set video source to web camera
        this.video.srcObject = stream;

        // Play the web camera video
        this.video.play();        
      } ).catch( ( error ) => {
        console.log( error );
      } );      
  }

  // Stop video stream
  stop() {
    let tracks = this.video.srcObject.getTracks();
    tracks[0].stop();    
  }  

  squares( contours ) {
    let remove = [];

    // Find squares
    for( let c = 0; c < contours.length; c++ ) {
      // Squares have four corners
      if( contours[c].length != 4 ) {
        remove.push( c );
        continue;
      }

      // Order points
      // Top-left, top-right, bottom-right, bottom-left
      contours[c] = this.order( contours[c] ).splice( 0 );

      // Squares have (roughly) equal length sides
      if( !this.measure( contours[c] ) ) {
        remove.push( c );
        continue;
      }

      // Squares have (roughly) ninety (90) degree angles
      if( !this.angles( contours[c] ) ) {
        remove.push( c );
        continue;
      }

      // Squares in cube will have minimal rotation
      // Checking one side will do
      let rotation = Math.atan2( contours[c][1].y - contours[c][0].y, contours[c][1].x - contours[c][0].x ) * ( 180 / Math.PI );
      if( rotation > ( 0 + Camera.VARIATION_ROTATE ) || 
          rotation < ( 0 - Camera.VARIATION_ROTATE ) ) {
        remove.push( c );
        continue;
      }
    }

    // Remove non-squares
    for( let r = 0; r < remove.length; r++ ) {
      contours.splice( remove[r] - r, 1 );
    }    
  }
}

Camera.MODE_VIDEO = 0;
Camera.MODE_CONTRAST = 1;
Camera.MODE_WEIGHTED = 2;
Camera.MODE_AVERAGED = 3;
Camera.MODE_GAUSSIAN = 4;
Camera.MODE_FILTERS = 5;
Camera.MODE_CANNY = 6;
Camera.MODE_DILATE = 7;
Camera.MODE_THRESHOLD = 8;
Camera.MODE_CONTOURS = 9;
Camera.MODE_POLYGONS = 10;
Camera.MODE_SQUARES = 11;
Camera.VARIATION_ANGLE = 20;
Camera.VARIATION_ROTATE = 10;
Camera.VARIATION_SIDE = 0.60;
