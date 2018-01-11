class Solver {
  constructor() {
    this.camera = new Camera( false );
    this.cube = new Cube();
    this.faces = [
      new Face( document.body, 'green' ),
      new Face( document.body, 'red' ),
      new Face( document.body, 'blue' ),
      new Face( document.body, 'orange' ),
      new Face( document.body, 'white' ),
      new Face( document.body, 'yellow' )
    ];

    let scramble = [
      'WYRBGBRBO',
      'BWBOROYYG',
      'OWYGBRRWO',
      'BRGYOYGBW',
      'ROWGWGOGW',
      'GRBWYOYRY'
    ];

    for( let s = 0; s < scramble.length; s++ ) {
      this.cube.side = s;
      this.cube.colors = scramble[s];

      this.faces[s].colors = scramble[s];
    }

    this.cube.side = 0;
    console.log( this.cube.colors );
    console.log( this.faces[0].colors );

    this.cube.all = 'WYRBGBRBOBWBOROYYGOWYGBRRWOBRGYOYGBWROWGWGOGWGRBWYOYRY';
    console.log( this.cube.colors );

    this.cube.rotate();
  }
}

// Application
let app = new Solver();
