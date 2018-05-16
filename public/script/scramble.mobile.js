class Scramble {
  constructor() {
    this.sides = [];

    this.root = document.querySelector( '#scramble' );

    for( let s = 0; s < 6; s++ ) {
      let side = new Side( this.root );
      this.sides.push( side );
    }
  }

  set colors( values ) {
    for( let s = 0; s < this.sides.length; s++ ) {
      if( !this.sides[s].visible ) {
        this.sides[s].colors = values;
        break;
      }
    }
  }
}
