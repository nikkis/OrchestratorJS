var httprequest = require( "request" );
var socket = require('socket.io-client').connect('http://0.0.0.0:9002');

socket.on( 'online', function ( contextValue, deviceIdentity ) {
  if ( contextValue != true )
    return;
  
  var params = {};
  params[ 'actionName' ] = 'Monolog';
  params[ 'parameters' ] = [ 'device:' + deviceIdentity, 'welcome back online' ];

  httprequest( {
    uri: 'http://0.0.0.0:9000/api/1/actioninstance',
    method: "POST",
    form: params
  }, function( error, response, body ) {
    console.log( 'body: '+body );
  } );
  
});
