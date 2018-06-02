class Mask {
  constructor( path ) {
    this.root = document.querySelector( path );

    // Assume mobile
    let width = this.root.parentElement.clientWidth;
    let height = this.root.parentElement.clientWidth;

    // Surface to mask
    let element = document.createElementNS( Mask.SVG, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', width );
    element.setAttributeNS( null, 'height', height );
    element.setAttributeNS( null, 'fill', 'rgba( 0, 0, 0, 0.20 )' );
    element.setAttributeNS( null, 'style', 'mask: url( #three );' );
    this.root.appendChild( element );    

    // Definitiions
    let defs = document.createElementNS( Mask.SVG, 'defs' );
    this.root.appendChild( defs );    

    // Mask
    let three = document.createElementNS( Mask.SVG, 'mask' );
    three.setAttributeNS( null, 'id', 'three' );
    defs.appendChild( three );    

    // Cover
    element = document.createElementNS( Mask.SVG, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', width );
    element.setAttributeNS( null, 'height', height );
    element.setAttributeNS( null, 'fill', 'white' );    
    three.appendChild( element );

    let square = Math.round( ( width - 32 ) / 3 );
    let left = 8;

    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        // Mask
        let element = document.createElementNS( Mask.SVG, 'rect' );
        element.setAttributeNS( null, 'x', left + ( ( square + 8 ) * c ) );
        element.setAttributeNS( null, 'y', 8 + ( ( square + 8 ) * r ) );
        element.setAttributeNS( null, 'width', square );
        element.setAttributeNS( null, 'height', square );
        element.setAttributeNS( null, 'rx', 6 );        
        element.setAttributeNS( null, 'fill', 'black' );                    
        three.appendChild( element );
      }
    }
  }
}

Mask.SVG = 'http://www.w3.org/2000/svg';
