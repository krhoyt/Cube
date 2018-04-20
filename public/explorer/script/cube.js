class Cube {
  constructor( path ) {
    this.index = 0;
    this.sides = [];

    this.root = document.querySelector( path );

    for( let s = 0; s < Cube.SIDE_COUNT; s++ ) {
      let side = new Side( this.root );
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

  side( colors ) {
    this.sides[this.index].colors = colors;
    this.sides[this.index].show();
  }
}

Cube.SIDE_COUNT = 6;
