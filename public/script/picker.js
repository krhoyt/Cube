class Picker {
  constructor() {
    this.root = document.querySelector( '#picker' );
    this.root.style.width = Math.round( (window.innerWidth - 32 ) / 3 ) + 'px';
    this.root.style.height = Math.round( (window.innerWidth - 32 ) / 3 ) + 'px';    

    for( let c = 0; c < 6; c++ ) {
      let element = document.createElement( 'div' );
      element.addEventListener( 'touchstart', ( evt ) => this.doPick( evt ) );
      this.root.appendChild( element );
    }
  }

  set palette( value ) {
    let index = 0;
    let options = this.root.querySelectorAll( 'div' );

    for( let color in value.sides ) {
      options[index].style.backgroundColor = value.sides[color].name;
      options[index].setAttribute( 'data-side', color );
      index = index + 1;
    }
  }

  doPick( evt ) {
    
  }
}
