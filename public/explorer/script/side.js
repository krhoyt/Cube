class Side {
  constructor( element ) {
    this.faces = [];

    this.svg = document.createElementNS( Side.SVG_NAMESPACE, 'svg' );
    this.svg.setAttributeNS( null, 'width', Side.SIZE );
    this.svg.setAttributeNS( null, 'height', Side.SIZE );   
    this.svg.style.display = 'none'; 

    for( let y = 0; y < 3; y++ ) {
      for( let x = 0; x < 3; x++ ) {
        let border = document.createElementNS( Side.SVG_NAMESPACE, 'rect' );
        border.setAttributeNS( null, 'width', Side.CUBIE_SIZE );
        border.setAttributeNS( null, 'height', Side.CUBIE_SIZE );
        border.setAttributeNS( null, 'fill', Side.COLOR_BACKGROUND );
        border.setAttributeNS( null, 'rx', Side.CUBIE_RADIUS );        
        border.setAttributeNS( null, 'ry', Side.CUBIE_RADIUS );
        border.setAttributeNS( null, 'x', ( x * Side.CUBIE_SIZE ) - ( 3 * x ) );        
        border.setAttributeNS( null, 'y', ( y * Side.CUBIE_SIZE ) - ( 3 * y ) );
        this.svg.appendChild( border );

        let face = document.createElementNS( Side.SVG_NAMESPACE, 'rect' );
        face.setAttributeNS( null, 'width', Side.FACE_SIZE );
        face.setAttributeNS( null, 'height', Side.FACE_SIZE );
        face.setAttributeNS( null, 'fill', Side.COLOR_FILL );
        face.setAttributeNS( null, 'rx', 3 );        
        face.setAttributeNS( null, 'ry', 3 );
        face.setAttributeNS( null, 'x', ( x * Side.CUBIE_SIZE ) - ( 3 * x ) + 3 );        
        face.setAttributeNS( null, 'y', ( y * Side.CUBIE_SIZE ) - ( 3 * y ) + 3 );
        this.svg.appendChild( face );        

        this.faces.push( face );
      }
    }

    element.appendChild( this.svg );
  }

  set colors( value ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      this.faces[f].setAttributeNS( null, 'fill', value[f] );
    }  
  }

  get colors() {
    let result = [];

    for( let f = 0; f < this.faces.length; f++ ) {
      result.push( this.faces[f].getAttributeNS( null, 'fill' ) );
    }

    return result;
  }

  hide() {
    this.svg.style.display = 'none';
  }

  show() {
    this.svg.style.display = 'block';
  }
}

Side.COLOR_BACKGROUND = 'black';
Side.COLOR_FILL = 'white';
Side.CUBIE_RADIUS = 4;
Side.CUBIE_SIZE = 31;
Side.FACE_SIZE = 25;
Side.SIZE = 87;
Side.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
