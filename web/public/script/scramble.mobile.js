class Scramble extends Observer {
  constructor() {
    super();

    this.index = 0;
    this.sides = [];

    this.root = document.querySelector( '#scramble' );

    for( let s = 0; s < 6; s++ ) {
      let side = new Side( this.root );
      this.sides.push( side );
    }
  }

  get state() {
    let results = [];

    for( let s = 0; s < this.sides.length; s++ ) {
      results.push( this.sides[s].colors );
    }

    return results;
  }

  set state( values ) {
    for( let s = 0; s < this.sides.length; s++ ) {
      this.sides[s].colors = values[s];
    }
  }

  clear() {
    this.index = 0;

    for( let s = 0; s < this.sides.length; s++ ) {
      this.sides[s].hide();
    }
  }

  push( colors ) {
    this.sides[this.index].colors = colors;
    this.sides[this.index].show();
    this.index = this.index + 1;

    if( this.index == this.sides.length ) {
      this.index = 0;
      this.emit( Scramble.EVENT_FILLED, this.state );
    }
  }  
}

Scramble.EVENT_FILLED = 'scramble_filled';
