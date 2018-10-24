self.addEventListener( 'message', ( evt ) => {
  // Create ImageData on this side of the transfer
  let pixels = new ImageData( evt.data.width, evt.data.height );
  pixels.data.set( new Uint8ClampedArray( evt.data.pixels ) );

  // Average pixel values
  for( let x = 0; x < pixels.data.length; x += 4 ) {
    let average = ( 
      pixels.data[x] +
      pixels.data[x + 1] +
      pixels.data[x + 2]
    ) / 3;
    
    // Put average into pixel
    // Red, green, blue all the same
    pixels.data[x] = average;
    pixels.data[x + 1] = average;
    pixels.data[x + 2] = average;
  }

  // Post modified ImageData
  self.postMessage( {
    type: 'done',
    pixels: pixels.data.buffer
  }, [pixels.data.buffer] );
} );
