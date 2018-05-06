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

    let square = this.canvas.width / 3;
    let space = square / 3;
    let left = 0;

    for( let r = 0; r < 3; r++ ) {
      for( let c = 0; c < 3; c++ ) {
        let x = left + Math.round( ( c * square ) + ( ( square - space ) / 2 ) );
        let y = Math.round( ( r * square ) + ( ( square - space ) / 2 ) );

        this.swatches.push( {
          x: x,
          y: y,
          width: Math.round( space ),
          height: Math.round( space )
        } );
        
        console.log( this.swatches[this.swatches.length - 1] );
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
