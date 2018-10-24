// Holder for multiple canvas and context
class ImageCanvas {
  constructor( path ) {
    this.canvas = document.querySelector( path );
    this.context = this.canvas.getContext( '2d' );
  }
}
