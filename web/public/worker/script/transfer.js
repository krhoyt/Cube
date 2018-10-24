class WorkIt {
  constructor() {
    // Resulting grayscale ImageData
    this.grayscale = null;

    // Web Worker for image processing
    this.worker = new Worker( '/script/worker/transfer.js' );
    this.worker.addEventListener( 'message', ( evt ) => this.doWorkerMessage( evt ) );

    // Input canvas for camera stream
    // Output canvas for grayscale results
    this.input = new ImageCanvas( '#input' );
    this.output = new ImageCanvas( '#output' );

    // Attach web camera to video element
    this.video = document.querySelector( 'video' );
    navigator.mediaDevices.getUserMedia({video: true, audio: false} )
    .then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();

      // Draw results
      this.draw();

      // Process results
      this.process();
    } )
    .catch( ( err ) => {
      console.log( err );
    } );
  }

  draw() {
    // Draw the results if any
    // Only displaying right half
    if( this.grayscale !== null ) {
      this.output.context.putImageData( 
        this.grayscale, 
        this.output.canvas.clientWidth / 2, 
        0 
      );      
    }   
    
    // Keep drawing
    requestAnimationFrame( () => {return this.draw();} );     
  }

  process() {
    // Capture a frame from the camera stream
    this.input.context.drawImage( this.video, 0, 0 );

    // Get the ImageData for processing
    // Only the right half of the frame
    const pixels = this.input.context.getImageData(
      this.input.canvas.clientWidth / 2, 
      0, 
      this.input.canvas.clientWidth / 2, 
      this.input.canvas.clientHeight
    );

    // Image processing in Web Worker
    this.worker.postMessage( {
      pixels: pixels.data.buffer,
      width: this.input.canvas.clientWidth / 2,
      height: this.input.canvas.clientHeight,
      channels: 4
    }, [pixels.data.buffer] );
  }

  doWorkerMessage( evt ) {
    // Back to ImageData
    let pixels = new ImageData( 
      this.input.canvas.clientWidth / 2, 
      this.input.canvas.clientHeight 
    );
    pixels.data.set( new Uint8ClampedArray( evt.data.pixels ) );

    // Store results from image processing
    this.grayscale = pixels;

    // Process another frame
    this.process();
  }
}

// Main
const app = new WorkIt();
