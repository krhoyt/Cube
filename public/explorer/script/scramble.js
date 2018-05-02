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

  clear() {
    this.index = 0;

    for( let s = 0; s < this.sides.length; s++ ) {
      this.sides[s].hide();
    }
  }

  hide() {
    this.clear();
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
      this.emit( Scramble.EVENT_COMPLETE, this.state );
    } else {
      this.index = this.index + 1;
    }
  }

  get state() {
    let result = [];

    for( let s = 0; s < Scramble.SIDE_LABELS.length; s++ ) {
      result.push( this.sides[s].colors );
    }

    return result;
  }

  set state( colors ) {
    for( let s = 0; s < Scramble.SIDE_LABELS.length; s++ ) {
      this.sides[s].colors = colors[s];
    }
  }
}

Scramble.EVENT_COMPLETE = 'scramble_complete';
Scramble.SIDE_LABELS = 'FRBLUD';
