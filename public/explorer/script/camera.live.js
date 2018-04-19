class Camera {
  constructor() {
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );
    
    this.video = document.querySelector( 'video' );
    navigator.mediaDevices.getUserMedia( {
      audio: false, 
      video: true
    } ).then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();        
      this.analyze();
    } ).catch( ( error ) => {
      console.log( error );
    } );
  }

  analyze() {
    this.context.drawImage( this.video, 0, 0 );

    let image = new jsfeat.matrix_t( this.canvas.width, this.canvas.height, jsfeat.U8_t | jsfeat.C1_t );    
    let kernel = ( 3 + 1 ) << 1;          
    let pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height );
    
    jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, image, jsfeat.COLOR_RGBA2GRAY );            
    jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
    jsfeat.imgproc.canny( image, image, 20, 40 );
    jsfeat.imgproc.dilate( image, image );

    image.width = image.cols;
    image.height = image.rows;    

    let contours = CV.findContours( image, [] );    

    if( contours.length > 0 ) {          
      for( let c = 0; c < contours.length; c++ ) {
        contours[c] = CV.approxPolyDP( contours[c], contours[c].length * 0.03 );      
      }            

      this.squares( contours );          
      this.bounds( contours );
    }

    requestAnimationFrame( () => {return this.analyze();} );              
  }

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

  bounds( contours ) {
    let min_x = -1;
    let min_y = -1;
    let max_x = -1;
    let max_y = -1;

    for( let c = 0; c < contours.length; c++ ) {
      for( let p = 0; p < contours[c].length; p++ ) {
        if( min_x === -1 ) {
          min_x = contours[c][p].x;
          max_x = contours[c][p].x;
          min_y = contours[c][p].y;          
          max_y = contours[c][p].y;          
        } else {
          min_x = Math.min( min_x, contours[c][p].x );
          max_x = Math.max( max_x, contours[c][p].x );
          min_y = Math.min( min_y, contours[c][p].y );
          max_y = Math.max( max_y, contours[c][p].y );        
        }
      }
    }

    let width = max_x - min_x;
    let height = max_y - min_y;

    this.context.beginPath();
    this.context.lineWidth = 5;
    this.context.strokeStyle = 'red';      
    this.context.rect( min_x, min_y, width, height );
    this.context.closePath();
    this.context.stroke();

    width = ( max_x - min_x ) / 3;
    height = ( max_y - min_y ) / 3;

    for( let y = 0; y < 3; y++ ) {
      for( let x = 0; x < 3; x++ ) {
        this.context.beginPath();
        this.context.lineWidth = 5;
        this.context.strokeStyle = 'white';      
        this.context.arc( 
          min_x + ( width * x ) + ( width / 2 ), 
          min_y + ( height * y ) + ( height / 2 ),
          width / 2,
          0,
          2 * Math.PI
        );
        this.context.stroke();        
      }
    }
  }

  distance( a, b ) {
    return Math.sqrt( Math.pow( b.x - a.x, 2 ) + Math.pow( b.y - a.y, 2 ) );
  }

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

    // Require certain size squares
    if( longest < Camera.CUBIE_MINIMUM || longest > Camera.CUBIE_MAXIMUM ) {
      return false;
    }

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

Camera.CUBIE_MAXIMUM = 160;
Camera.CUBIE_MINIMUM = 35;
Camera.MEDIAN_MINIMUM = 0.50;
Camera.MEDIAN_MAXIMUM = 2;
Camera.VARIATION_ANGLE = 20;
Camera.VARIATION_ROTATE = 10;
Camera.VARIATION_SIDE = 0.60;
