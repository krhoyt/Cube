class Explorer {
  constructor() {
    // Components
    this.menu = new Menu( '.header > button' );
    this.menu.addEventListener( Menu.ITEM_SELECTED, ( evt ) => this.doMenuItem( evt ) );
  }

  doMenuItem( evt ) {
    console.log( evt );
  }
}

// Application entry point
let app = new Explorer();
