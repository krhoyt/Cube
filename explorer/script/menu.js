class Menu extends Observer {
  constructor( path ) {
    // Inherit observer
    super();

    // Menu items
    this.items = [];

    // Desktop or mobile
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false

    // Menu button
    this.button = document.querySelector( path );
    this.button.addEventListener( 
      this.touch ? 'touchstart' : 'click', 
      ( evt ) => this.doButton( evt )
     );

    // Block
    // Block clicks to underlying interface
    // Close for clicks outside of drawer
    this.block = document.createElement( 'div' );
    this.block.addEventListener( 
      this.touch ? 'touchstart' : 'click', 
      ( evt ) => this.doBlock( evt ) 
    );
    this.block.classList.add( 'block' );
    document.body.appendChild( this.block );

    // Menu
    this.menu = document.createElement( 'dl' );
    this.menu.classList.add( 'drawer' );
    this.menu.classList.add( 'hidden' );
    document.body.appendChild( this.menu );

    // Load menu data
    // Build menu items
    fetch( Menu.ITEMS )
      .then( ( response ) => {return response.json();} )
      .then( ( items ) => {
        this.build( items );
      } );
  }

  // Build menu items
  build( items ) {
    for( let i = 0; i < items.length; i++ ) {
      // Has children
      if( items[i].items ) {
        let item = document.createElement( 'dt' );
        item.innerHTML = items[i].label;
        this.menu.appendChild( item );

        // Build children
        this.build( items[i].items );
      } else {
        // No children
        let item = document.createElement( 'dd' );
        item.addEventListener( 
          this.touch ? 'touchstart' : 'click', 
          ( evt ) => this.doItem( evt ) 
        );

        if( items[i].selected ) {
          item.classList.add( 'selected' );
        }

        item.setAttribute( 'data-index', items[i].index );
        item.innerHTML = items[i].label;
        this.menu.appendChild( item );

        // Keep reference
        this.items.push( item );
      }
    }
  }

  // Hide block and drawer
  hide() {
    this.block.style.display = 'none';
    this.menu.classList.add( 'hidden' );
  }

  // Show block and drawer
  show() {
    this.block.style.display = 'block';
    this.menu.classList.remove( 'hidden' );    
  }

  // Click on block
  // Hide block and drawer
  doBlock( evt ) {
    this.hide();
  }

  // Click on menu button
  // Show block and drawer
  doButton( evt ) {
    this.show();
  }

  // Click on menu item
  // Hide block and drawer
  doItem( evt ) {
    // Notify listeners if not already selected
    if( !evt.target.classList.contains( 'selected' ) ) {
      for( let i = 0; i < this.items.length; i++ ) {
        if( this.items[i] === evt.target ) {
          this.items[i].classList.add( 'selected' );
        } else {
          this.items[i].classList.remove( 'selected' );
        }
      }

      const index = parseInt( evt.target.getAttribute( 'data-index' ) )
      this.emit( Menu.ITEM_SELECTED, index );
    }

    this.hide();
  }
}

Menu.ITEMS = 'data/menu.json';
Menu.ITEM_SELECTED = 'menu_item_selected';
