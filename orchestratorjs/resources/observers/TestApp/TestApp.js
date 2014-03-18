var httprequest = require( "request" );
var socket = require('socket.io-client').connect('http://0.0.0.0:9002');

socket.on( 'online', function ( contextValue, deviceIdentity ) {
  if ( contextValue != true || deviceIdentity != 'nikkis@s3mini' )
    return;
  
  var params = {};
  params[ 'actionName' ] = 'MakeCoffee';
  params[ 'parameters' ] = [ 'device:nikkis@gadgeteer', 'device:nikkis@s3mini' ];

  httprequest( {
    uri: 'http://0.0.0.0:9000/api/1/actioninstance',
    method: "POST",
    form: params
  }, function( error, response, body ) {
    console.log( 'body: '+body );
  } );
  
});


socket.on( 'coffeeReady', function ( contextValue, deviceIdentity ) {
  if ( contextValue != true )
    return;
  
  var params = {};
  params[ 'actionName' ] = 'InviteForCoffee';
  params[ 'parameters' ] = [ 'device:nikkis@s3mini', 'device:nikkis@desire' ];

  httprequest( {
    uri: 'http://0.0.0.0:9000/api/1/actioninstance',
    method: "POST",
    form: params
  }, function( error, response, body ) {
    console.log( 'body: '+body );
  } );
  
});
