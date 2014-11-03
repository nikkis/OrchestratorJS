module.exports = {

  // the body
  body: function ( dev ) {
    
		console.log( dev.getContextData( 'proximityDevices' ) );
  
  }
  
};
