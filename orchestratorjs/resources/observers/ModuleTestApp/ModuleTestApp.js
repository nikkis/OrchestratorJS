var httprequest = require('../../tools.js').httprequest;
var pubsub      = require('../../tools.js').pubsub();


module.exports = {

  settings: { coffeeMachineId: null },

  logic: function() {
    
    console.log('naa naa naaaa');
    
    pubsub.on( 'online', function ( contextValue, deviceIdentity ) {
    
      if ( contextValue != true || deviceIdentity != 'nikkis@s3mini' )
        return;

      var params = {};
      params[ 'actionName' ] = 'Monolog';
      params[ 'parameters' ] = [ 'device:nikkis@s3mini', 'hellou' ];

      httprequest( {
        uri: '/api/1/actioninstance',
        method: "POST",
        form: params
      }, function( error, response, body ) {
        console.log( 'body: '+body );
      } );
  
    });
    
    pubsub.on( 'coffeeReady', function ( contextValue, deviceIdentity ) {
      if ( contextValue != true )
        return;
  
      var params = {};
      params[ 'actionName' ] = 'InviteForCoffee';
      params[ 'parameters' ] = [ settings.coffeeMachineId, deviceIdentity ];

      httprequest( {
        uri: '/api/1/actioninstance',
        method: "POST",
        form: params
      }, function( error, response, body ) {
        console.log( 'body: '+body );
      } );
  
   });
     
  }
};