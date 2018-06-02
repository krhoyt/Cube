class Cube {
  constructor( width = 93, height = 93, background = 0xf5f5f5,interactive = true ) {
    this.cubies = [];
    this.side = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( background );    
    
    this.camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    this.camera.position.z = 3.75;    
    // this.camera.position.y = 2;        
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );        

    this.renderer = new THREE.WebGLRenderer( {antialias: true} );
    this.renderer.setSize( width, height );
    
    document.body.appendChild( this.renderer.domElement );

    if( interactive ) {
      this.controls = new THREE.OrbitControls( this.camera );
    }

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

    // Build and rotate sides
    // Move by association with tertiary object
    for( let side in Palette.sides ) {
      // Side
      this.build( Palette.sides[side].hex );

      // Center 
      this.pivot.rotation.set( 0, 0, 0 );
      this.pivot.updateMatrixWorld();

      // Move from scene to center
      for( let c = 0; c < 9; c++ ) {
        this.cubies[( this.side * 9 ) + c].updateMatrixWorld();
        THREE.SceneUtils.attach( this.cubies[( this.side * 9 ) + c], this.scene, this.pivot );        
      }

      // Rotate center
      // Place side in basic orientation
      if( this.side < 4 ) {
        this.pivot.rotation.y = THREE.Math.degToRad( this.side * 90 );
      } else if( this.side == 4 ) {
        this.pivot.rotation.x = THREE.Math.degToRad( -90 );        
      } else if( this.side == 5 ) {
        this.pivot.rotation.x = THREE.Math.degToRad( 90 );                
      }

      // Update matrix
      this.pivot.updateMatrixWorld();      

      // Move from center to scene
      for( let c = 0; c < 9; c++ ) {
        THREE.SceneUtils.detach( this.cubies[( this.side * 9 ) + c], this.pivot, this.scene );        
      }      

      this.side = this.side + 1;
    }

    this.side = 0;

    this.render();
  }

  build( color = 0x00ff00 ) {    
    for( let y = 1; y > -2; y-- ) {
      for( let x = -1; x < 2; x++ ) {
        let cubie = new THREE.Mesh( 
          new THREE.BoxGeometry( 
            Cube.CUBIE_DIMENSIONS, 
            Cube.CUBIE_DIMENSIONS, 
            Cube.CUBIE_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: Palette.background
        } ) );
        let sticker = new THREE.Mesh( 
          new THREE.BoxGeometry( 
            Cube.STICKER_DIMENSIONS, 
            Cube.STICKER_DIMENSIONS, 
            Cube.STICKER_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: ( x == 0 && y == 0 ) ? color : Palette.nuetral
        } ) );        
        sticker.position.set( 0, 0, 0.1 );

        let group = new THREE.Group();  
        group.add( cubie );
        group.add( sticker );

        this.cubies.push( group );
        this.cubies[this.cubies.length - 1].position.set( x, y, 1 );        

        this.scene.add( this.cubies[this.cubies.length - 1] );        
      }
    }
  }

  set all( value ) {
    value = value.toUpperCase();

    for( let c = 0; c < this.cubies.length; c++ ) {
      this.cubies[c].children[1].material.color.setHex( Palette.sides[value.charAt( c )].hex );
    }    
  }

  get all() {
    let result = '';

    for( let c = 0; c < this.cubies.length; c++ ) {
      for( let side in Palette.sides ) {
        if( Palette.sides[side].hex == this.cubies[( this.side * 9 ) + c].children[1].material.color.getHex() ) {
          result = result + Palette.sides[side].short;
          break;
        }
      }
    }

    return result;    
  }

  set colors( value ) {
    value = value.toUpperCase();

    for( let c = 0; c < 9; c++ ) {
      this.cubies[( this.side * 9 ) + c].children[1].material.color.setHex( Palette.sides[value.charAt( c )].hex );
    }
  }

  get colors() {
    let result = '';

    for( let c = 0; c < 9; c++ ) {
      for( let side in Palette.sides ) {
        if( Palette.sides[side].hex == this.cubies[( this.side * 9 ) + c].children[1].material.color.getHex() ) {
          result = result + Palette.sides[side].short;
          break;
        }
      }
    }

    return result;
  }  

  render() {
    // Orbit controls
    if( this.controls ) {
      this.controls.update();    
    }

    // Render scene
    this.renderer.render( this.scene, this.camera );    

    // Keep rendering
    requestAnimationFrame( () => { return this.render(); } );    
  }

  rotate( degrees = -90, axis = 'y', part = 0 ) {
    // Center 
    this.pivot.rotation.set( 0, 0, 0 );
    this.pivot.updateMatrixWorld();

    let group = [];

    if( part == 0 ) {
      group = this.cubies.slice( 0 );
    } else {
      // Find cubies that apply to desired turn
      for( let c = 0; c < this.cubies.length; c++ ) {
        if( Math.round( this.cubies[c].position[axis] ) == part ) {
          group.push( this.cubies[c] );
        }
      }
    }

    // Move from scene to pivot
    for( let g = 0; g < group.length; g++ ) {
      group[g].updateMatrixWorld();
      THREE.SceneUtils.attach( group[g], this.scene, this.pivot );            
    }

    // Animation details
    let animation = {
      onComplete: function( cubies, pivot, scene ) {
        // Update matrix
        pivot.updateMatrixWorld();      

        for( let c = 0; c < cubies.length; c++ ) {
          THREE.SceneUtils.detach( cubies[c], pivot, scene );        
        }    
      },
      onCompleteParams: [group, this.pivot, this.scene]
    };

    // Dynamic axis property
    animation[axis] = THREE.Math.degToRad( degrees );

    // Animate
    TweenMax.to( this.pivot.rotation, 1, animation );
  }
}

Cube.CUBIE_DIMENSIONS = 1;
Cube.STICKER_DIMENSIONS = 0.90;
Cube.WIDTH = 93;
Cube.HEIGHT = 93;
