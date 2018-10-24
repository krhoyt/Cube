class WorkIt {
  constructor() {
    this.bounds = null;
    this.colors = null;

    // Web Worker for image processing
    this.worker = new Worker( '/script/worker/track.js' );
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
    // Clear any previous drawing
    this.output.context.clearRect( 
      0, 
      0, 
      this.output.canvas.clientWidth, 
      this.output.canvas.clientHeight 
    );

    // Cube is present
    if( this.bounds !== null ) {
      // Draw bounds
      this.output.context.beginPath();
      this.output.context.lineWidth = 5;
      this.output.context.strokeStyle = 'lime';      
      this.output.context.rect( 
        this.bounds.x, 
        this.bounds.y, 
        this.bounds.width, 
        this.bounds.height 
      );
      this.output.context.closePath();
      this.output.context.stroke();

      // Draw colors for cubies
      for( let color = 0; color < this.colors.length; color++ ) {
        this.output.context.beginPath();
        this.output.context.arc( 
          this.colors[color].x * 2, 
          this.colors[color].y * 2, 
          Math.round( this.bounds.width / 6 ), 
          0, 
          2 * Math.PI, 
          false 
        );
        this.output.context.fillStyle = `rgb( ${this.colors[color].red}, ${this.colors[color].green}, ${this.colors[color].blue} )`;
        this.output.context.fill();
        this.output.context.lineWidth = 5;
        this.output.context.strokeStyle = 'white';
        this.output.context.stroke();
      }
    }

    // Keep drawing
    requestAnimationFrame( () => {return this.draw();} );     
  }

  process() {
    // Capture a frame from the camera stream
    this.input.context.drawImage( 
      this.video, 
      0, 
      0, 
      this.input.canvas.clientWidth, 
      this.input.canvas.clientHeight 
    );

    // Get the ImageData for processing
    const pixels = this.input.context.getImageData(
      0, 
      0, 
      this.input.canvas.clientWidth, 
      this.input.canvas.clientHeight
    );

    // Image processing in Web Worker
    this.worker.postMessage( {      
        pixels: pixels.data.buffer, 
        width: this.input.canvas.clientWidth,
        height: this.input.canvas.clientHeight,
      },
      [pixels.data.buffer] 
    );
  }

  doWorkerMessage( evt ) {
    // Found a cube
    if( evt.data.position.width > 0 ) {
      // Store bounds
      // Double dimensions
      // Scaled down by half for processing
      this.bounds = {
        x: evt.data.position.x1 * 2,
        y: evt.data.position.y1 * 2,
        width: evt.data.position.width * 2,
        height: evt.data.position.height * 2
      };
      this.colors = evt.data.colors.slice( 0 );
    } else {
      this.bounds = null;
    }

    // Process another frame
    this.process();
  }
}

// Main
const app = new WorkIt();
