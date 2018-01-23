class Camera {
  constructor( path = '#camera' ) {
    this._palette = null;

    this.root = document.querySelector( path );
    
    this.video = this.root.querySelector( 'video' );
    
    this.prism = new Prism();    

    this.mask = new Mask();
    this.mask.addEventListener( Mask.EDIT, ( evt ) => this.doEdit( evt ) );    

    this.picker = new Picker();
    this.picker.addEventListener( Picker.SELECT, ( evt ) => this.doSelect( evt ) );            
  }

  set palette( value ) {
    this._palette = value;

    this.mask.palette = value;
    this.mask.side = 'G';

    this.prism.palette = value;

    this.picker.palette = value;
  }

  get palette() {
    return this._palette;
  }

  analyze() {
    // let colors = this.prism.analyze();
    this.mask.colors = this.prism.analyze();
  }

  reset() {
    this.mask.clear();
    this.picker.hide();
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
    this.picker.move( evt.x, evt.y );
    this.picker.show();
  }

  doSelect( evt ) {
    this.mask.color = evt.color;
    this.picker.hide();
  }  
}
