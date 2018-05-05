class Scramble {
  constructor() {
    this.cubies = [];
    this.group = [];
    this.side = 0;

    this.root = document.querySelector( '#scramble' );

    let styles = window.getComputedStyle( this.root, null );
    let background = styles.getPropertyValue( 'background-color' );
    
    this.width = parseInt( styles.getPropertyValue( 'width' ) );
    this.height = parseInt( styles.getPropertyValue( 'height' ) );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( background );        

    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 0.1, 1000 );
    this.camera.position.z = 4;    

    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );        
    
    this.renderer = new THREE.WebGLRenderer( {antialias: true} );
    this.renderer.setSize( this.width, this.height );
    
    this.root.appendChild( this.renderer.domElement );    

    this.pivot = new THREE.Mesh( 
      new THREE.SphereGeometry( 0.5 ),
      new THREE.MeshBasicMaterial( {
        color: 0xff00ff
      } ) 
    );
    this.scene.add( this.pivot );    

    this.buildCube();

    this.render();
  }

  set colors( values ) {
    for( let c = 0; c < 9; c++ ) {
      this.cubies[( this.side * 9 ) + c].children[1].material.color.set( 
        `rgb( ${value[c].red}, ${value[c].green}, ${value[c].blue} )`
      );
    }
  }

  buildCube() {
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
            Scramble.CUBIE_DIMENSIONS, 
            Scramble.CUBIE_DIMENSIONS, 
            Scramble.CUBIE_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: Scramble.CUBIE_COLOR
        } ) );

        // Sticker
        let sticker = new THREE.Mesh( 
          new THREE.BoxGeometry( 
            Scramble.STICKER_DIMENSIONS, 
            Scramble.STICKER_DIMENSIONS, 
            Scramble.STICKER_DIMENSIONS 
          ),
          new THREE.MeshBasicMaterial( {
            color: Scramble.NEUTRAL_COLOR
        } ) );        
        sticker.position.set( 0, 0, Scramble.STICKER_OFFSET );

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

  render() {
    this.renderer.render( this.scene, this.camera );    
    requestAnimationFrame( () => { return this.render(); } );        
  }  
}

Scramble.CUBIE_COLOR = 0x000000;
Scramble.CUBIE_DIMENSIONS = 1.0;
Scramble.NEUTRAL_COLOR = 0xd3d3d3;
Scramble.STICKER_DIMENSIONS = 0.90;
Scramble.STICKER_OFFSET = 0.10;
