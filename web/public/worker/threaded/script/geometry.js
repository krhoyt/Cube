self.importScripts( 
  '/lib/jsfeat.js', 
  '/lib/jsfeat.kernel.js', 
  '/lib/cv.js', 
  '/lib/cv.kernel.js' 
);

self.addEventListener( 'message', ( evt ) => {
  let pixels = new ImageData( 320, 240 );
  pixels.data.set( new Uint8ClampedArray( evt.data ) );

  const kernel = ( 3 + 1 ) << 1;          

  let image = new jsfeat.matrix_t( 320, 240, jsfeat.U8_t | jsfeat.C1_t );
  image.width = image.cols;
  image.height = image.rows;

  jsfeat.imgproc.grayscale( pixels.data, 320, 240, image, jsfeat.COLOR_RGBA2GRAY );  
  jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
  jsfeat.imgproc.canny( image, image, 20, 40 );
  jsfeat.imgproc.dilate( image, image );  
  
  let contours = CV.findContours( image, [] );

  if( contours.length > 0 ) {
    for( let c = 0; c < contours.length; c++ ) {
      contours[c] = CV.approxPolyDP( contours[c], contours[c].length * 0.03 );      
    }   

    squares( contours );          

    if( contours.length > 0 ) {
      contours = bounds( contours );
    } else {
      contours = [];
    }    
  }

  postMessage( contours );
} );

self.angles = function( polygon ) {
  variation = 20;

  let corners = [];
  let variations = [0, 90, 180, 90];

  // Get angles
  corners.push( Math.atan2( polygon[1].y - polygon[0].y, polygon[1].x - polygon[0].x ) * ( 180 / Math.PI ) );
  corners.push( Math.atan2( polygon[2].y - polygon[1].y, polygon[2].x - polygon[1].x ) * ( 180 / Math.PI ) );
  corners.push( Math.atan2( polygon[3].y - polygon[2].y, polygon[3].x - polygon[2].x ) * ( 180 / Math.PI ) );        
  corners.push( Math.atan2( polygon[0].y - polygon[3].y, polygon[0].x - polygon[3].x ) * ( 180 / Math.PI ) );    

  // Check if within acceptable range
  for( let c = 0; c < corners.length; c++ ) {
    if( ( Math.abs( corners[c] ) < ( variations[c] - variation ) ) ||
        ( Math.abs( corners[c] ) > ( variations[c] + variation ) ) ) {
      return false;
    }
  }

  // This is a square
  return true;
}

self.bounds = function( contours ) {
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

  return {
    x: min_x,
    y: min_y,
    width: max_x - min_x,
    height: max_y - min_y
  };
}
 
self.distance = function( a, b ) {
  return Math.sqrt( Math.pow( b.x - a.x, 2 ) + Math.pow( b.y - a.y, 2 ) );
}

self.measure = function( polygon, variation, minimum, maximum ) {
  variation = 0.60;
  minimum = 17;
  maximum = 80;

  let distances = [];

  // Calculate distance for each side
  distances.push( distance( polygon[0], polygon[1] ) );
  distances.push( distance( polygon[1], polygon[2] ) );
  distances.push( distance( polygon[2], polygon[3] ) );    
  distances.push( distance( polygon[3], polygon[0] ) );    

  // Find the longest of the sides
  // Apply amount of variation we are willing to tolerate
  let longest = Math.max( distances[0], distances[1], distances[2], distances[3] );
  let cutoff = longest * variation;

  // Require certain size squares
  if( longest < minimum || longest > maximum ) {
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

self.order = function( polygon ) {
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

self.squares = function( contours ) {
  variation = 10;

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
    if( rotation > ( 0 + variation ) || 
        rotation < ( 0 - variation ) ) {
      remove.push( c );
      continue;
    }
  }

  // Remove non-squares
  for( let r = 0; r < remove.length; r++ ) {
    contours.splice( remove[r] - r, 1 );
  }    
}
