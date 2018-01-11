class Icicle {
  constructor( root, width = 640, height = 480 ) {
    // General
    this.constraints = {
      audio: false,
      video: true      
    };
    this.width = width;
    this.height = height;
    this.playing = false;

    // Canvas
    this.canvas = document.createElement( 'canvas' );
    root.appendChild( this.canvas );

    // Video
    // Not initially playing
    this.video = document.createElement( 'video' );
    this.video.setAttribute( 'playsinline', true );
    this.video.style.position = 'absolute';
    this.video.style.visibility = 'hidden';
    root.appendChild( this.video );

    // Get list of media inputs for device
    navigator.mediaDevices.enumerateDevices().then( ( devices ) => {
      let cameras = 0;

      // Count cameras
      for( let d = 0; d < devices.length; d++ ) {
        if( devices[d].kind == 'videoinput' ) {
          cameras = cameras + 1;
        }
      }

      // Mobile device
      // Or at least a device with a rear camera
      // Use that
      if( cameras > 1 ) {
        // Mobile gets same width and height
        this.width = window.innerWidth;
        this.height = window.innerWidth;

        // Require rear camera
        this.constraints.video = {
          facingMode: {
            exact: 'environment'
          }
        };
      }

      // Size canvas
      // May be mobile, default, or specified sizing
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // Drawing
      // Analysis
      this.context = this.canvas.getContext( '2d' );      

      // Size video
      this.video.width = this.width;

      // Start video
      this.start();
    } );
  }

  // Render web camera to canvas
  // Allows for image processing
  render() {
    // Draw video to canvas
    this.context.drawImage( 
      this.video, 
      0, 
      ( this.height - this.canvas.height ) / 2,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height 
    );

    // If video is playing
    // Keep rendering
    if( this.playing ) {
      requestAnimationFrame( () => { return this.render(); } );        
    } else {
      // Video stopped
      // Clear display
      this.context.clearRect( 0, 0, this.width, this.height );
    }
  }  

  // Grab web camera
  // Start video
  start() {
    // Web camera
    navigator.mediaDevices.getUserMedia( this.constraints ).then( ( stream ) => {
      // Set video source to web camera
      this.video.srcObject = stream;
  
      // Wait for stream to start
      this.video.onloadedmetadata = function( evt ) {
        // Non-rendered elements not measured
        // Calculate computed style
        // Store once for duration of application
        let computed = window.getComputedStyle( this.video, null );
        this.height = computed.getPropertyValue( 'height' );
        this.height = parseInt( this.height.substring( 0, this.height.length - 2 ) );

        // Remove from display
        this.video.style.display = 'none';

        // Play the web camera video
        this.video.play();

        // Mark as playing
        // Allows render to canvas
        this.playing = true;

        // Start rendering to canvas
        this.render();
      }.bind( this );
    } ).catch( ( error ) => {
      console.log( error );
    } );
  }

  // Turn off web camera
  stop() {
    // Get video stream
    // Stop video stream
    let tracks = this.video.srcObject.getTracks();
    tracks[0].stop();

    // Mark as no longer playing
    // Will cause render to clear canvas
    this.playing = false;
  }  
}
