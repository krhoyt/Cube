class Sides {
  constructor() {
    this.faces = [];

    this.root = document.querySelector( '#sides' );
    this.svg = document.createElementNS( Sides.SVG_NAMESPACE, 'svg' );

    for( let y = 0; y < 3; y++ ) {
      for( let x = 0; x < 3; x++ ) {
        let border = document.createElementNS( Sides.SVG_NAMESPACE, 'rect' );
        border.setAttributeNS( null, 'width', 31 );
        border.setAttributeNS( null, 'height', 31 );
        border.setAttributeNS( null, 'fill', 'black' );
        border.setAttributeNS( null, 'rx', 4 );        
        border.setAttributeNS( null, 'ry', 4 );
        border.setAttributeNS( null, 'x', x * 31 - ( 3 * x ) );        
        border.setAttributeNS( null, 'y', y * 31 - ( 3 * y ) );
        this.svg.appendChild( border );

        let face = document.createElementNS( Sides.SVG_NAMESPACE, 'rect' );
        face.setAttributeNS( null, 'width', 25 );
        face.setAttributeNS( null, 'height', 25 );
        face.setAttributeNS( null, 'fill', 'green' );
        face.setAttributeNS( null, 'rx', 3 );        
        face.setAttributeNS( null, 'ry', 3 );
        face.setAttributeNS( null, 'x', x * 31 - ( 3 * x ) + 3 );        
        face.setAttributeNS( null, 'y', y * 31 - ( 3 * y ) + 3 );
        this.svg.appendChild( face );        
      }
    }

    this.root.appendChild( this.svg );
  }
}

Sides.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
