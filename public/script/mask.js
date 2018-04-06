class Mask extends Observer {
  constructor( path = '#mask' ) {
    super();
    
    this.faces = [];
    this.palette = null;
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false; 

    this.root = document.querySelector( path );

    // Assume mobile
    let width = this.root.parentElement.clientWidth;
    let height = this.root.parentElement.clientWidth;

    // Adjust for desktop
    if( !this.touch ) {
      width = this.root.parentElement.clientWidth;
      height = this.root.parentElement.clientHeight;
    }

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

    if( !this.touch ) {
      square = Math.round( ( height - 32 ) / 3 );
      left = Math.round( ( width - ( ( square + 8 ) * 3 ) ) / 2 );
    }

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

        // Display
        element = document.createElementNS( Mask.SVG, 'rect' );
        element.setAttributeNS( null, 'x', left + ( ( square + 8 ) * c ) );
        element.setAttributeNS( null, 'y', 8 + ( ( square + 8 ) * r ) );
        element.setAttributeNS( null, 'width', square );
        element.setAttributeNS( null, 'height', square );
        element.setAttributeNS( null, 'rx', 6 );        
        element.setAttributeNS( null, 'fill', 'none' );
        element.setAttributeNS( null, 'style', 'opacity: 0.80;' );
        element.addEventListener( this.touch ? 'touchstart' : 'click', ( evt ) => this.doEdit( evt ) );
        this.root.appendChild( element );        
        this.faces.push( element );
      }
    }
  }

  clear() {
    this.colors = 'ZZZZ' + this.side + 'ZZZZ';
  }
  
  set color( value ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      if( this.faces[f].getAttribute( 'data-selected' ) == 'true' ) {
        if( value == 'Z' ) {
          this.faces[f].setAttributeNS( null, 'fill', 'none' );
        } else {
          this.faces[f].setAttributeNS( null, 'fill', this.palette.sides[value].name );
        }

        this.faces[f].setAttributeNS( null, 'data-color', value );
        this.faces[f].setAttributeNS( null, 'data-selected', false );        
      }
    }
  }

  get color() {
    return this.faces[f].getAttribute( 'data-color' );
  }

  set colors( value ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      if( value.charAt( f ) == 'Z' ) {
        this.faces[f].setAttributeNS( null, 'fill', 'none' );
      } else {
        let color = this.palette.sides[value.charAt( f )].name;        
        this.faces[f].setAttributeNS( null, 'fill', color );
      }

      this.faces[f].setAttributeNS( null, 'data-color', value.charAt( f ) );                    
    }
  }

  get colors() {
    let result = '';

    for( let f = 0; f < this.faces.length; f++ ) {
      result = result + this.faces[f].getAttribute( 'data-color' );
    }

    return result;
  }

  set side( value ) {
    this.root.setAttributeNS( null, 'data-side', value );
    this.faces[4].setAttributeNS( null, 'fill', this.palette.sides[value].name );
  }

  get side() {
    return this.root.getAttribute( 'data-side' );
  }

  doEdit( evt ) {
    for( let f = 0; f < this.faces.length; f++ ) {
      if( this.faces[f] == evt.target ) {
        this.faces[f].setAttributeNS( null, 'data-selected', true );
      } else {
        this.faces[f].setAttributeNS( null, 'data-selected', false );        
      }
    }

    this.emit( Mask.EDIT, {
      x: evt.target.getAttribute( 'x' ),
      y: evt.target.getAttribute( 'y' ),
      color: evt.target.getAttribute( 'data-color' )
    } );
  }
}

Mask.SVG = 'http://www.w3.org/2000/svg';
Mask.EDIT = 'edit_event';
