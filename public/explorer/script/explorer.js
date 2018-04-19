class Explorer {
  constructor() {
    // Components
    this.menu = new Menu( '#menu' );
    this.menu.addEventListener( Menu.ITEM_SELECTED, ( evt ) => this.doMenuItem( evt ) );

    this.camera = new Camera( '#camera' );
    this.camera.start();

    this.sides = new Sides();
  }

  // Menu item selected
  doMenuItem( evt ) {
    // Debug
    console.log( evt );

    // Set camera mode
    this.camera.mode = evt;
  }
}

// Application entry point
let app = new Explorer();
