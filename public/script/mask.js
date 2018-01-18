class Mask {
  constructor( root ) {
    this.faces = [];
    this.listeners = [];
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
        element.setAttributeNS( null, 'data-index', ( r * 3 ) + c );
        element.addEventListener( 'touchstart', ( evt ) => this.doChange( evt ) );
        root.appendChild( element );        
        this.faces.push( element );
      }
    }
  }

  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
  }  

  clear() {
    for( let f = 0; f < this.faces.length; f++ ) {
      this.faces[f].setAttributeNS( null, 'fill', 'none' );
    }
  }
  
  set colors( value ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      let color = this.palette.sides[value.charAt( f )].name ;

      this.faces[f].setAttributeNS( null, 'fill', color );
      this.faces[f].setAttributeNS( null, 'data-side', value.charAt( f ) );      
    }
  }

  get colors() {
    let result = '';

    for( let f = 0; f < this.faces.length; f++ ) {
      result = result + this.faces[f].getAttribute( 'data-side' );
    }

    return result;
  }

  doChange( evt ) {
    this.emit( Mask.CHANGE_EVENT, {
      x: evt.target.getAttribute( 'x' ),
      y: evt.target.getAttribute( 'y' ),
      index: evt.target.getAttribute( 'data-index' )
    } );
  }
}

Mask.SVG = 'http://www.w3.org/2000/svg';
Mask.CHANGE_EVENT = 'change_event';
