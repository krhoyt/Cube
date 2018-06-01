class Side {
  constructor( element ) {
    this.cubies = [];

    this.svg = document.createElementNS( Side.SVG_NAMESPACE, 'svg' );
    this.svg.setAttributeNS( null, 'width', Side.SIZE );
    this.svg.setAttributeNS( null, 'height', Side.SIZE );    
    this.svg.style.display = 'none'; 

    for( let y = 0; y < 3; y++ ) {
      for( let x = 0; x < 3; x++ ) {
        let cubie = document.createElementNS( Side.SVG_NAMESPACE, 'rect' );
        
        cubie.setAttributeNS( null, 'width', Side.CUBIE_SIZE );
        cubie.setAttributeNS( null, 'height', Side.CUBIE_SIZE );
        cubie.setAttributeNS( null, 'rx', Side.CUBIE_RADIUS );        
        cubie.setAttributeNS( null, 'ry', Side.CUBIE_RADIUS );
        cubie.setAttributeNS( null, 'x', ( x * Side.CUBIE_SIZE ) );        
        cubie.setAttributeNS( null, 'y', ( y * Side.CUBIE_SIZE ) );
        this.svg.appendChild( cubie );

        this.cubies.push( cubie );
      }
    }

    element.appendChild( this.svg );
  }

  set colors( value ) {
    for( let c = 0; c < this.cubies.length; c++ ) {
      this.cubies[c].setAttributeNS( 
        null, 
        'fill', 
        `rgb( ${value[c].red}, ${value[c].green}, ${value[c].blue} )` 
      );

      this.cubies[c].setAttribute( 'data-red', value[c].red );
      this.cubies[c].setAttribute( 'data-green', value[c].green );
      this.cubies[c].setAttribute( 'data-blue', value[c].blue );
      this.cubies[c].setAttribute( 'data-l', value[c].l );
      this.cubies[c].setAttribute( 'data-a', value[c].a );
      this.cubies[c].setAttribute( 'data-b', value[c].b );                        
    }  
  }

  get colors() {
    let results = [];

    for( let c = 0; c < this.cubies.length; c++ ) {
      results.push( {
        red: parseInt( this.cubies[c].getAttribute( 'data-red' ) ),
        green: parseInt( this.cubies[c].getAttribute( 'data-green' ) ),
        blue: parseInt( this.cubies[c].getAttribute( 'data-blue' ) ),
        l: parseFloat( this.cubies[c].getAttribute( 'data-l' ) ),
        a: parseFloat( this.cubies[c].getAttribute( 'data-a' ) ),
        b: parseFloat( this.cubies[c].getAttribute( 'data-b' ) )
      } );
    }

    return results;
  }

  set visible( value ) {
    if( value ) {
      this.show();
    } else {
      this.hide();
    }
  }

  get visible() {
    return this.svg.style.display === 'none' ? false : true;
  }

  hide() {
    this.svg.style.display = 'none';
  }

  show() {
    this.svg.style.display = 'block';
  }
}

Side.CUBIE_RADIUS = 2;
Side.CUBIE_SIZE = Math.round( ( window.innerWidth * 0.14 ) / 3 );
Side.SIZE = Math.round( window.innerWidth * 0.14 );
Side.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
