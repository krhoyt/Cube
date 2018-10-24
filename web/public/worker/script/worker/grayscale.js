self.addEventListener( 'message', ( evt ) => {
  // Shortcut to ImageData object
  let pixels = evt.data;

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
  self.postMessage( pixels );
} );
