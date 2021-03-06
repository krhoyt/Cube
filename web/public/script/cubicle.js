class Cubicle extends Observer {
  constructor( path = '#cube' ) {
    super();

    // General
    this.cubies = [];
    this.group = [];
    this._palette = null;
    this.side = Cubicle.FRONT;
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false;         

    this.root = document.querySelector( path );

    // Use background color of containing element
    let styles = window.getComputedStyle( this.root, null );
    let background = styles.getPropertyValue( 'background-color' );
    
    this.width = parseInt( styles.getPropertyValue( 'width' ) );
    this.height = parseInt( styles.getPropertyValue( 'height' ) );

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( background );        

    // Camera
    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 0.1, 1000 );
    this.camera.position.z = 4;    

    if( !this.touch ) {
      this.camera.position.y = 2.5;
      this.camera.position.x = 2.5;
    }

    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );        
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer( {antialias: true} );
    this.renderer.setSize( this.width, this.height );
    
    // Add to document
    this.root.appendChild( this.renderer.domElement );    

    // Orbit controls
    this.controls = new THREE.OrbitControls( this.camera );
    this.controls.enabled = false;

    // Center
    // Pivot
    // Used for side rotation
    this.pivot = new THREE.Mesh( 
      new THREE.SphereGeometry( 0.5 ),
      new THREE.MeshBasicMaterial( {
        color: 0xff00ff
      } ) 
    );
    this.scene.add( this.pivot );    

    // Render
    this.render()

    // Next button
    this.next = document.createElement( 'button' );
    this.next.style.top = Math.round( ( this.root.clientHeight - 36 ) / 2 ) + 'px';
    this.next.addEventListener( this.touch ? 'touchstart' : 'click', ( evt ) => this.doNext( evt ) );
    this.root.appendChild( this.next );
  }

  // Manage orbit controls
  set interactive( value ) {
    this.controls.enabled = value;
  }

  get interactive() {
    return this.controls.enabled;
  }

  set palette( value ) {
    this._palette = value;
    this.build();
  }

  get palette() {
    return this._palette;
  }

  // Build the whole cube
  build() {
    // Build side
    // Rotate to place
    // Move by association with pivot
    for( let s = 0; s < 6; s++ ) {
      // Side
      this.buildSide();

      // Set pivot orientation
      this.pivot.rotation.set( 0, 0, 0 );
      this.pivot.updateMatrixWorld();

      // Move from scene to pivot
      for( let c = 0; c < 9; c++ ) {
        this.cubies[( s * 9 ) + c].updateMatrixWorld();
        THREE.SceneUtils.attach( 
          this.cubies[( s * 9 ) + c], 
          this.scene, 
          this.pivot 
        );        
      }

      // Rotate pivot
      // Place side in basic orientation
      if( s < 4 ) {
        // Side rotated on y-axis
        this.pivot.rotation.y = THREE.Math.degToRad( s * 90 );
      } else if( s == 4 ) {
        // Top rotated on x-axis
        this.pivot.rotation.x = THREE.Math.degToRad( -90 );        
      } else if( s == 5 ) {
        // Bottom rotated on x-axis
        this.pivot.rotation.x = THREE.Math.degToRad( 90 );                
      }

      // Update matrix
      this.pivot.updateMatrixWorld();      

      // Move from center to scene
      for( let c = 0; c < 9; c++ ) {
        THREE.SceneUtils.detach( 
          this.cubies[( s * 9 ) + c], 
          this.pivot, 
          this.scene 
        );        
      }      
    }
  }

  // Build a side of the cube
  // Faces are colorized separately
  buildSide() {
    for( let y = 1; y > -2; y-- ) {
      for( let x = -1; x < 2; x++ ) {
        // Cubie
        let cubie = new THREE.Mesh( 
          new THREE.BoxGeometry( 
            Cubicle.CUBIE_DIMENSIONS, 
            Cubicle.CUBIE_DIMENSIONS, 
            Cubicle.CUBIE_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: Cubicle.CUBIE_COLOR
        } ) );

        // Sticker
        let sticker = new THREE.Mesh( 
          new THREE.BoxGeometry( 
            Cubicle.STICKER_DIMENSIONS, 
            Cubicle.STICKER_DIMENSIONS, 
            Cubicle.STICKER_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: Cubicle.NEUTRAL_COLOR
        } ) );        
        sticker.position.set( 0, 0, Cubicle.STICKER_OFFSET );

        // Put sticker on cubie
        let group = new THREE.Group();  
        group.add( cubie );
        group.add( sticker );

        // Store reference
        this.cubies.push( group );

        // Set position of cubie with sticker
        this.cubies[this.cubies.length - 1].position.set( x, y, 1 );        

        // Add to scene
        this.scene.add( this.cubies[this.cubies.length - 1] );        
      }
    }
  }

  // Manage sticker colors
  // TODO: More robust assignment that works after rotation
  colorize( side = Cubicle.FRONT, colors = 'GGGGGGGGG' ) {
    console.log( colors );
    colors = colors.toUpperCase();

    for( let c = 0; c < 9; c++ ) {
      if( colors.charAt( c ) == 'Z' ) {
        this.cubies[( side * 9 ) + c].children[1].material.color.set( Cubicle.NEUTRAL_COLOR );        
        continue;
      }

      this.cubies[( side * 9 ) + c].children[1].material.color.set( 
        this.palette.sides[colors.charAt( c )].name 
      );
    }
  }

  // Render
  render() {
    // Scene
    this.renderer.render( this.scene, this.camera );    

    // Keep rendering
    requestAnimationFrame( () => { return this.render(); } );        
  }

  // Rotate whole cube or side of cube
  rotate( part = 0, axis = 'y', degrees = -90 ) {
    // Anchor on pivot
    this.unmount( part, axis );
    
    // Animation details
    let animation = {
      onComplete: function( cube ) {
        cube.mount();
      },
      onCompleteParams: [this]
    };

    // Dynamic axis property
    animation[axis] = THREE.Math.degToRad( degrees );

    // Animate
    TweenMax.to( this.pivot.rotation, 1, animation );
  }  

  flip() {
    this.unmount( 0, 'x' );
    this.rotate( 0, 'x', 180 );
  }

  turn() {
    this.unmount( 0, 'y' );
    this.rotate( 0, 'y', -90 );
  }

  twist() {

  }

  mount() {
    // Update matrix
    this.pivot.updateMatrixWorld();      

    // Move from pivot to scene
    for( let g = 0; g < this.group.length; g++ ) {
      THREE.SceneUtils.detach( this.group[g], this.pivot, this.scene );        
    }    
  }

  unmount( part = 0, axis = 'y' ) {
    // Set center 
    this.pivot.rotation.set( 0, 0, 0 );
    this.pivot.updateMatrixWorld();

    // Cubies to rotate
    this.group = [];

    // This whole cube
    if( part == 0 ) {
      this.group = this.cubies.slice( 0 );
    } else {
      // Only a side of the cube
      // Find cubies that apply to desired turn
      for( let c = 0; c < this.cubies.length; c++ ) {
        if( Math.round( this.cubies[c].position[axis] ) == part ) {
          this.group.push( this.cubies[c] );
        }
      }
    }

    // Move from scene to pivot
    for( let g = 0; g < this.group.length; g++ ) {
      this.group[g].updateMatrixWorld();
      THREE.SceneUtils.attach( this.group[g], this.scene, this.pivot );            
    }
  }

  doNext( evt ) {
    evt.target.blur();

    if( this.side < 5 ) {
      this.side = this.side + 1;
    } else {
      this.side = 0;
    }

    switch( this.side ) {
      case 0:
      case 1:
      case 2:
      case 3: 
        this.turn();      
        break;
      case 4:
        this.twist();
        break;
      case 5:
        this.flip();
        break;      
    }

    this.emit( Cubicle.TURN, this.side );    
  }
}

Cubicle.FRONT = 0;
Cubicle.RIGHT = 1;
Cubicle.BACK = 2;
Cubicle.LEFT = 3;
Cubicle.UP = 4;
Cubicle.DOWN = 5;
Cubicle.CUBIE_COLOR = 0x000000;
Cubicle.CUBIE_DIMENSIONS = 1.0;
Cubicle.NEUTRAL_COLOR = 0xd3d3d3;
Cubicle.STICKER_DIMENSIONS = 0.90;
Cubicle.STICKER_OFFSET = 0.10;
Cubicle.TURN = 'event_turn';
