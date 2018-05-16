class Camera extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( '#camera' );    
    this.mask = new Mask( '#camera > svg' );    
    
    this.canvas = this.root.querySelector( '#camera > canvas' );
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerWidth;
    this.context = this.canvas.getContext( '2d' );
    
    this.swatches = [];    

    for( let r = 1; r < 6; r += 2 ) {
      for( let c = 1; c < 6; c += 2 ) {
        this.swatches.push( {
          x: Math.round( c * ( window.innerWidth / 6 ) ),
          y: Math.round( r * ( window.innerWidth / 6 ) )
        } );
      }    
    }        
    
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
    this.context.drawImage( this.video, 0, 0 );

    let pixels = this.context.getImageData( 0, 0, window.innerWidth, window.innerWidth );
    let colors = [];

    for( let s = 0; s < this.swatches.length; s++ ) {
      let rgb = {
        red: pixels.data[( this.swatches[s].y * window.innerWidth * 4 ) + ( this.swatches[s].x * 4 )],            
        green: pixels.data[( this.swatches[s].y * window.innerWidth * 4 ) + ( this.swatches[s].x * 4 ) + 1],
        blue: pixels.data[( this.swatches[s].y * window.innerWidth * 4 ) + ( this.swatches[s].x * 4 ) + 2]
      };
      rgb2lab( rgb );          
      colors.push( rgb );
    }

    this.emit( Camera.EVENT_COLORS, colors );
  }
}

Camera.EVENT_COLORS = 'camera_colors';
