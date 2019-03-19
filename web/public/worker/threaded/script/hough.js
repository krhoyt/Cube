self.importScripts( '/lib/jsfeat.js' );

self.addEventListener( 'message', ( evt ) => {
  let pixels = new ImageData( 320, 240 );
  pixels.data.set( new Uint8ClampedArray( evt.data ) );

  const kernel = ( 3 + 1 ) << 1;          

  let image = new jsfeat.matrix_t( 320, 240, jsfeat.U8_t | jsfeat.C1_t );
  jsfeat.imgproc.grayscale( pixels.data, 320, 240, image, jsfeat.COLOR_RGBA2GRAY );  
  jsfeat.imgproc.gaussian_blur( image, image, kernel, 0 );        
  jsfeat.imgproc.canny( image, image, 20, 40 );
  // jsfeat.imgproc.dilate( image, image );
  // img, rho_res, theta_res, threshold
  const lines = jsfeat.imgproc.hough_transform( image, 1, Math.PI / 180, 55 );  

  /*
  let lines = probabilisticHoughTransform( 
    pixels.data, 
    pixels.width, 
    pixels.height, 
    1, 
    Math.PI / 45, 
    65, 
    95, 
    50, 
    100 
  );
  */

  postMessage( lines );  
} );
