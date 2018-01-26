class Camera {
  constructor( path = '#camera' ) {
    this.listeners = [];
    this._palette = null;

    this.root = document.querySelector( path );
    
    this.video = this.root.querySelector( 'video' );
    
    this.prism = new Prism();    

    this.mask = new Mask();
    this.mask.addEventListener( Mask.EDIT, ( evt ) => this.doEdit( evt ) );    

    this.picker = new Picker();
    this.picker.addEventListener( Picker.SELECT, ( evt ) => this.doSelect( evt ) );            
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
    let colors = this.prism.analyze();
    
    this.mask.colors = colors;
    this.emit( Camera.ANALYZE, colors );
  }

  reset() {
    this.mask.clear();
    this.picker.hide();
  }

  start() {
    let video = true;

    navigator.mediaDevices.enumerateDevices()
      .then( ( devices ) => {
        let count = 0;
        
        devices.forEach( ( device ) => {
          if( device.kind == 'videoinput' ) {
            count = count + 1;
          }
        } );

        let video = true;

        if( count > 1 ) {
          video = {
            facingMode: {
              exact: 'environment'
            }
          }
        }

        return  navigator.mediaDevices.getUserMedia( {
          audio: false, 
          video: video
        } );
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

    this.emit( Camera.ANALYZE, this.mask.colors );
  }  
}

Camera.ANALYZE = 'event_analyze';
