class Ants {
  constructor() {
    this.listeners = [];

    // Bounds of movement
    this._bounds = null;    

    // Mouse position inside swatch
    this.offset = null;

    // Be able to remove events listeners
    this.doMove = this.doMove.bind( this );
    this.doUp = this.doUp.bind( this );

    // Ready to start moving
    this.root = document.querySelector( '#ants' );
    this.root.addEventListener( 'mousedown', ( evt ) => this.doDown( evt ) );
  }

  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
  }  

  bounds( x, y, width, height ) {
    this._bounds = {
      x: x,
      y: y,
      width: width,
      height: height
    };

    this.move( x, y );
  }

  hide() {
    this.root.style.display = 'none';
  }

  move( x, y ) {
    // No bounds set
    // Just move
    if( this._bounds === null ) {
      this.root.style.left = x + 'px';
      this.root.style.top = y + 'px';      
      return;
    }

    // Lock to bounds
    if( 
      x >= this._bounds.x && 
      y >= this._bounds.y && 
      ( x + this.root.clientWidth ) <= ( this._bounds.x + this._bounds.width ) && 
      ( y + this.root.clientHeight ) <= ( this._bounds.y + this._bounds.height ) ) {
      this.root.style.left = x + 'px';
      this.root.style.top = y + 'px';
    } else {
      // TODO: Slide along edges inside bounds
    }
  }

  show() {
    this.root.style.display = 'block';
  }

  size( width, height ) {
    this.width = width;
    this.height = height;

    this.root.style.width = width + 'px';
    this.root.style.height = height = 'px';
  }

  doDown( evt ) {
    // Record mouse inside swatch
    this.offset = {
      x: evt.offsetX,
      y: evt.offsetY
    };

    // Listen for mouse movement on document
    document.addEventListener( 'mousemove', this.doMove );
    document.addEventListener( 'mouseup', this.doUp );
  }

  doMove( evt ) {
    // Move swatch
    this.move( 
      evt.clientX - this.offset.x,
      evt.clientY - this.offset.y
    );
  }

  doUp( evt ) {
    // Clean up
    this.offset = null;

    // Remove listeners
    document.removeEventListener( 'mousemove', this.doMove );
    document.removeEventListener( 'mouseup', this.doUp );

    // Broadcast new position
    // Relative to specified bounds
    this.emit( Ants.CHANGE, {
      x: Math.round( parseInt( this.root.style.left ) - this._bounds.x ),
      y: Math.round( parseInt( this.root.style.top ) - this._bounds.y ),
      width: this.root.clientWidth,
      height: this.root.clientHeight
    } );
  }
}

Ants.CHANGE = 'event_change';
