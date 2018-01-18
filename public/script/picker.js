class Picker {
  constructor() {
    this.listeners = [];    

    this.root = document.querySelector( '#picker' );
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

  show( x = 8, y = 8 ) {
    this.root.style.left = x + 'px';
    this.root.style.top = y + 'px';
    this.root.style.display = 'grid';
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
    this.emit( Picker.COLOR_EVENT, {
      name: evt.target.getAttribute( 'fill' ),
      side: evt.target.getAttribute( 'data-side' )
    } );
    this.hide();
  }
}

Picker.COLOR_EVENT = 'color_event';