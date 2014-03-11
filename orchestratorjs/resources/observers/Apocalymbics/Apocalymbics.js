var httprequest = require( "request" );
var socket = require('socket.io-client').connect('http://0.0.0.0:9002');

socket.on( 'online', function ( contextValue, deviceIdentity ) {
  if ( contextValue != true )
    return;
  
  if ( deviceIdentity == 'nikkis@s3mini' ) {
    
    var params = {};
    params[ 'actionName' ] = 'Apocalymbics';
    params[ 'parameters' ] = [ [ 'device:nikkis@s3mini', 'device:nikkis@acer', 'device:timo@s3mini' ] ];

    httprequest( {
      uri: 'http://0.0.0.0:9000/api/1/actioninstance',
      method: "POST",
      form: params
    }, function( error, response, body ) {
      console.log( 'body: '+body );
    } );
  }
  else if ( deviceIdentity == 'nikkis@desire' )
  {
    var params = {};
    params[ 'actionName' ] = 'Apocalymbics';
    params[ 'parameters' ] = [ [ 'device:nikkis@desire', 'device:timo@desire' ] ];

    httprequest( {
      uri: 'http://0.0.0.0:9000/api/1/actioninstance',
      method: "POST",
      form: params
    }, function( error, response, body ) {
      console.log( 'body: '+body );
    } );
  }
});