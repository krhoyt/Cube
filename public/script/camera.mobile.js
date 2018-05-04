class Camera extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( '#camera' );    
    this.mask = new Mask( '#camera > svg' );    
    this.video = this.root.querySelector( '#camera > video' );

    navigator.mediaDevices.getUserMedia( {
      audio: false, 
      video: {
        facingMode: {
          exact: 'environment'
        }
      }
    } ).then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();        
    } ).catch( ( error ) => {
      console.log( error );
    } );      
  }

  capture() {

  }
}

Camera.EVENT_CAPTURE = 'camera_capture';
