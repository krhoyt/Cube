class Mask {
  constructor( root ) {
    this.faces = [];
    this.palette = null;

    let element = document.createElementNS( Mask.SVG, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', root.parentElement.clientWidth );
    element.setAttributeNS( null, 'height', root.parentElement.clientWidth );
    element.setAttributeNS( null, 'fill', 'rgba( 0, 0, 0, 0.20 )' );
    element.setAttributeNS( null, 'style', 'mask: url( #three );' );
    root.appendChild( element );    

    let defs = document.createElementNS( Mask.SVG, 'defs' );
    root.appendChild( defs );    

    let three = document.createElementNS( Mask.SVG, 'mask' );
    three.setAttributeNS( null, 'id', 'three' );
    defs.appendChild( three );    

    element = document.createElementNS( Mask.SVG, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', root.parentElement.clientWidth );
    element.setAttributeNS( null, 'height', root.parentElement.clientWidth );
    element.setAttributeNS( null, 'fill', 'white' );    
    three.appendChild( element );

    let square = Math.round( ( root.parentElement.clientWidth - 32 ) / 3 );

    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        // Mask
        let element = document.createElementNS( Mask.SVG, 'rect' );
        element.setAttributeNS( null, 'x', 8 + ( ( square + 8 ) * c ) );
        element.setAttributeNS( null, 'y', 8 + ( ( square + 8 ) * r ) );
        element.setAttributeNS( null, 'width', square );
        element.setAttributeNS( null, 'height', square );
        element.setAttributeNS( null, 'rx', 6 );        
        element.setAttributeNS( null, 'fill', 'black' );                    
        three.appendChild( element );

        // Display
        element = document.createElementNS( Mask.SVG, 'rect' );
        element.setAttributeNS( null, 'x', 8 + ( ( square + 8 ) * c ) );
        element.setAttributeNS( null, 'y', 8 + ( ( square + 8 ) * r ) );
        element.setAttributeNS( null, 'width', square );
        element.setAttributeNS( null, 'height', square );
        element.setAttributeNS( null, 'rx', 6 );        
        element.setAttributeNS( null, 'fill', 'none' );
        element.setAttributeNS( null, 'style', 'opacity: 0.80;' );
        element.addEventListener( 'touchstart', ( evt ) => this.doChange( evt ) );
        root.appendChild( element );        
        this.faces.push( element );
      }
    }
  }

  set colors( value ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      this.faces[f].setAttributeNS( 
        null, 
        'fill', 
        this.palette.sides[value.charAt( f )].name 
      );
    }
  }

  doChange( evt ) {
    console.log( 'Click.' );
  }
}

Mask.SVG = 'http://www.w3.org/2000/svg';
