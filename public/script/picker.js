class Picker {
  constructor( path = '#picker' ) {
    this.listeners = [];    

    this.root = document.querySelector( path );
    this.root.style.width = Math.round( (window.innerWidth - 32 ) / 3 ) + 'px';
    this.root.style.height = Math.round( (window.innerWidth - 32 ) / 3 ) + 'px';    

    for( let c = 0; c < 6; c++ ) {
      let element = document.createElement( 'div' );
      element.addEventListener( 'touchstart', ( evt ) => this.doPick( evt ) );
      this.root.appendChild( element );
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

  hide() {
    this.root.style.display = 'none';
  }

  move( x = 8, y = 8 ) {
    this.root.style.left = x + 'px';
    this.root.style.top = y + 'px';
  }

  show() {
    this.root.style.display = 'grid';
  }

  set palette( value ) {
    let index = 0;
    let options = this.root.querySelectorAll( 'div' );

    for( let color in value.sides ) {
      options[index].style.backgroundColor = value.sides[color].name;
      options[index].setAttribute( 'data-color', color );
      index = index + 1;
    }
  }

  doPick( evt ) {
    let x = evt.target.parentElement.style.left;
    let y = evt.target.parentElement.style.top;

    this.emit( Picker.SELECT, {
      name: evt.target.style.backgroundColor,
      color: evt.target.getAttribute( 'data-color' ),
      x: parseInt( x ),
      y: parseInt( y )
    } );
  }
}

Picker.SELECT = 'select_event';
