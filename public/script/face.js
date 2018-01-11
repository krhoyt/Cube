class Face {
  constructor( target, color = 'green' ) {
    let template = document.querySelector( '.face.template' );

    this.root = template.cloneNode( true );
    this.root.classList.remove( 'template' );
    target.appendChild( this.root );

    this.cubies = this.root.querySelectorAll( '.cubies' );
    this.cubies[4].setAttributeNS( null, 'full', color );
  }

  set colors( value ) {
    value = value.toUpperCase();

    for( let c = 0; c < value.length; c++ ) {
      this.cubies[c].setAttributeNS( null, 'fill', Palette.sides[value.charAt( c )].name );
    }
  }

  get colors() {
    let result = '';

    for( let c = 0; c < this.cubies.length; c++ ) {
      result = result + Palette.colors[this.cubies[c].getAttributeNS( null, 'fill' )];
    }

    return result;
  }
}
