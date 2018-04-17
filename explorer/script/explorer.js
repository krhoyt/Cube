class Explorer {
  constructor() {
    // Components
    this.menu = new Menu( '#menu' );
    this.menu.addEventListener( Menu.ITEM_SELECTED, ( evt ) => this.doMenuItem( evt ) );

    this.camera = new Camera( '#camera' );
    this.camera.start();
  }

  // Menu item selected
  doMenuItem( evt ) {
    // Debug
    console.log( evt );

    // Set camera mode
    this.camera.setMode( evt );
  }
}

// Application entry point
let app = new Explorer();
