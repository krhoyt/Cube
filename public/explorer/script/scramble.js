class Scramble extends Observer {
  constructor( path ) {
    super();

    this.index = 0;
    this.sides = [];

    this.root = document.querySelector( path );

    for( let s = 0; s < Scramble.SIDE_LABELS.length; s++ ) {
      let side = new Side( this.root, Scramble.SIDE_LABELS.charAt( s ) );
      this.sides.push( side );
    }
  }

  hide() {
    for( let s = 0; s < this.sides.length; s++ ) {
      this.sides[s].hide();
    }

    this.root.style.display = 'none';
  }

  isVisible() {
    let result = false;

    if( this.root.style.display === 'flex' ) {
      result = true;
    }

    return result;
  }

  show() {
    this.root.style.display = 'flex';
  }

  side( data ) {
    if( data.again ) {
      this.index = this.index - 1;
    }
      
    this.sides[this.index].colors = data.colors;
    this.sides[this.index].show();

    if( this.index === ( Scramble.SIDE_LABELS.length - 1 ) ) {
      this.index = 0;

      let state = [];

      for( let s = 0; s < Scramble.SIDE_LABELS.length; s++ ) {
        state = state.concat( this.sides[s].colors );
      }

      this.emit( Scramble.EVENT_READY, state );
    } else {
      this.index = this.index + 1;
    }
  }
}

Scramble.EVENT_READY = 'scramble_ready';
Scramble.SIDE_LABELS = 'FRBLUD';
