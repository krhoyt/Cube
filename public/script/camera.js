class Camera {
  constructor( path = '#camera' ) {
    this._palette = null;

    this.root = document.querySelector( path );
    
    this.video = this.root.querySelector( 'video' );
    
    this.prism = new Prism();    
    
    this.mask = new Mask();
    this.mask.addEventListener( Mask.CHANGE_EVENT, ( evt ) => this.doEdit( evt ) );    
  }

  set palette( value ) {
    this._palette = value;
    this.mask.palette = value;
  }

  get palette() {
    return this._palette;
  }

  start() {
    navigator.mediaDevices.getUserMedia( {
      audio: false, 
      video: {
        facingMode: {
          exact: 'environment'
        }
      }
    } )
    .then( ( stream ) => {
      // Set video source to web camera
      this.video.srcObject = stream;

      // Play the web camera video
      this.video.play();        
    } ).catch( ( error ) => {
      console.log( error );
    } );      
  }

  // Stop video stream
  stop() {
    let tracks = this.video.srcObject.getTracks();
    tracks[0].stop();    
  }

  doEdit( evt ) {
    
  }
}
