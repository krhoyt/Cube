class Candidate {
  constructor( contour ) {
    this.contour = contour.slice( 0 );
    this.polygon = CV.approxPolyDP( this.contour, 20 );
  }

  draw( context, color = 'red' ) {
    context.beginPath();
    context.lineWidth = 5;
    context.strokeStyle = color;      

    for( let p = 0; p < this.polygon.length; p++ ) {
      if( p == 0 ) {
        context.moveTo( this.polygon[p].x, this.polygon[p].y );
      } else {
        context.lineTo( this.polygon[p].x, this.polygon[p].y );          
      }
    }

    context.lineTo( this.polygon[0].x, this.polygon[0].y );          
    context.stroke();    
  }

  get_angle( a, b, c ) {
    let da = this.pixel_distance( c.x, c.y, b.x, b.y );
    let db = this.pixel_distance( a.x, a.y, c.x, c.y );    
    let dc = this.pixel_distance( a.x, a.y, b.x, b.y );        

    let cos_angle = null;

    try {
      cos_angle = ( Math.pow( da, 2 ) + Math.pow( db, 2 ) - Math.pow( dc, 2 ) ) / ( 2 * da * db );
    } catch( err ) {
      console.log( err );
    }

    if( cos_angle > 1 ) {
      cos_angle = 1;
    } else if( cos_angle < -1 ) {
      cos_angle = -1;
    }

    return Math.acos( cos_angle );
  }

  measure_sides() {
    let ab = this.pixel_distance( this.polygon[0].x, this.polygon[0].y, this.polygon[1].x, this.polygon[1].y );
    let ac = this.pixel_distance( this.polygon[0].x, this.polygon[0].y, this.polygon[2].x, this.polygon[2].y );
    let db = this.pixel_distance( this.polygon[3].x, this.polygon[3].y, this.polygon[1].x, this.polygon[1].y );    
    let dc = this.pixel_distance( this.polygon[3].x, this.polygon[3].y, this.polygon[2].x, this.polygon[2].y );    
    let distances = [ab, ac, db, dc];
    let max_distance = Math.max( ab, ac, db, dc );
    let cutoff = max_distance * 0.60;

    for( let d = 0; d < distances.length; d++ ) {
      if( distances[d] < cutoff ) {
        return false;
      }
    }

    return true;
  }

  pixel_distance( x1, y1, x2, y2 ) {
    return Math.sqrt( Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1, 2 ) );    
  }

  sort_corners() {
    let results = [];

    let min_x = null;
    let max_x = null;
    let min_y = null;
    let max_y = null;

    for( let c = 0; c < this.polygon.length; c++ ) {
      if( min_x == null || this.polygon[c].x < min_x ) min_x = this.polygon[c].x;
      if( max_x == null || this.polygon[c].x > max_x ) max_x = this.polygon[c].x;      
      if( min_y == null || this.polygon[c].y < min_y ) min_y = this.polygon[c].y;      
      if( max_y == null || this.polygon[c].y > max_y ) max_y = this.polygon[c].y;            
    }

    let top_left = null;
    let top_left_distance = null;

    for( let c = 0; c < this.polygon.length; c++ ) {
      let distance = this.pixel_distance( min_x, min_y, this.polygon[c].x, this.polygon[c].y );

      if( top_left_distance == null || distance < top_left_distance ) {
        top_left = {
          x: this.polygon[c].x,
          y: this.polygon[c].y
        };
        top_left_distance = distance;
      }
    }

    results.push( top_left );

    let top_right = null;
    let top_right_distance = null;

    for( let c = 0; c < this.polygon.length; c++ ) {
      let found = false;

      for( let p = 0; p < results.length; p++ ) {
        if( results[p].x == this.polygon[c].x && results[p].y == this.polygon[c].y ) {
          found = true;
          break;
        }
      }

      if( found ) continue;

      let distance = this.pixel_distance( min_x, min_y, this.polygon[c].x, this.polygon[c].y );

      if( top_right_distance == null || distance < top_right_distance ) {
        top_right = {
          x: this.polygon[c].x,
          y: this.polygon[c].y
        };
        top_right_distance = distance;
      }
    }

    results.push( top_right );    

    let bottom_left = null;
    let bottom_left_distance = null;

    for( let c = 0; c < this.polygon.length; c++ ) {
      let found = false;

      for( let p = 0; p < results.length; p++ ) {
        if( results[p].x == this.polygon[c].x && results[p].y == this.polygon[c].y ) {
          found = true;
          break;
        }
      }

      if( found ) continue;

      let distance = this.pixel_distance( min_x, min_y, this.polygon[c].x, this.polygon[c].y );

      if( bottom_left_distance == null || distance < bottom_left_distance ) {
        bottom_left = {
          x: this.polygon[c].x,
          y: this.polygon[c].y
        };
        bottom_left_distance = distance;
      }
    }

    results.push( bottom_left );    

    let bottom_right = null;
    let bottom_right_distance = null;

    for( let c = 0; c < this.polygon.length; c++ ) {
      let found = false;

      for( let p = 0; p < results.length; p++ ) {
        if( results[p].x == this.polygon[c].x && results[p].y == this.polygon[c].y ) {
          found = true;
          break;
        }
      }

      if( found ) continue;

      let distance = this.pixel_distance( min_x, min_y, this.polygon[c].x, this.polygon[c].y );

      if( bottom_right_distance == null || distance < bottom_right_distance ) {
        bottom_right = {
          x: this.polygon[c].x,
          y: this.polygon[c].y
        };
        bottom_right_distance = distance;
      }
    }

    results.push( bottom_right );

    this.polygon = results.slice( 0 );    
  }

  isSquare() {
    // Four points (corners)
    if( this.polygon.length != 4 ) {
      return false;
    }

    // 0 - Top, left
    // 1 - Top, right
    // 2 - Bottom, left
    // 3 - Bottom, right
    this.sort_corners();

    // TODO: Fix sorting
    // Shuffle to order correctly
    let hold = this.polygon[1];
    this.polygon[1] = this.polygon[2];
    this.polygon[2] = hold;
    
    // Roughly equal sides
    if( !this.measure_sides() ) {
      return false;
    }

    let min_angle = 90 - 20;
    let max_angle = 90 + 20;    

    // Roughly a right angle (90 degrees)
    let angle_a = this.get_angle( this.polygon[2], this.polygon[1], this.polygon[0] ) * ( 180 / Math.PI );
    if( angle_a < min_angle || angle_a > max_angle ) return false;

    let angle_b = this.get_angle( this.polygon[0], this.polygon[3], this.polygon[1] ) * ( 180 / Math.PI );
    if( angle_b < min_angle || angle_b > max_angle ) return false;

    let angle_c = this.get_angle( this.polygon[0], this.polygon[3], this.polygon[2] ) * ( 180 / Math.PI );
    if( angle_c < min_angle || angle_c > max_angle ) return false;

    let angle_d = this.get_angle( this.polygon[2], this.polygon[1], this.polygon[3] ) * ( 180 / Math.PI );
    if( angle_d < min_angle || angle_d > max_angle ) return false;

    // Roughly horizontal
    // Rotation
    let far_left  = Math.min( this.polygon[0].x, this.polygon[1].x, this.polygon[2].x, this.polygon[3].x );
    let far_right = Math.max( this.polygon[0].x, this.polygon[1].x, this.polygon[2].x, this.polygon[3].x );
    let far_up    = Math.min( this.polygon[0].y, this.polygon[1].y, this.polygon[2].y, this.polygon[3].y );
    let far_down  = Math.max( this.polygon[0].y, this.polygon[1].y, this.polygon[2].y, this.polygon[3].y );
    let top_left = {x: far_left, y: far_up};
    let top_right = {x: far_right, y: far_up};
    let bottom_left = {x: far_left, y: far_down};
    let bottom_right = {x: far_right, y: far_down};

    if( this.polygon[1].y < this.polygon[0].y ) {
      angle_b = this.get_angle( this.polygon[0], top_left, this.polygon[1] ) * ( 180 / Math.PI );
      if( angle_b > 30 ) return false;    
    } else {
      angle_a = this.get_angle( this.polygon[1], top_right, this.polygon[0] ) * ( 180 / Math.PI );
      if( angle_a > 30 ) return false;    
    }
    
    return true;
  }
}
