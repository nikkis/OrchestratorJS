var httprequest = require( '../../tools.js' ).httprequest;
var pubsub      = require( '../../tools.js' ).pubsub();


module.exports = {

  settings: { companionDeviceId: null },

  logic: function() {

    pubsub.on( 'online', function( contextValue, deviceIdentity ) {

      if ( deviceIdentity == 'nikkis@s3mini' ) {

        var params = {};
        params[ 'actionName' ] = 'Apocalymbics';
        params[ 'parameters' ] = [
          [ 'device:nikkis@s3mini', 'device:nikkis@acer', 'device:timo@s3mini' ]
        ];

        httprequest( {
          uri: '/api/1/actioninstance',
          method: "POST",
          form: params
        }, function( error, response, body ) {
          console.log( 'body: ' + body );
        } );
      } else if ( deviceIdentity == 'nikkis@desire' ) {
        var params = {};
        params[ 'actionName' ] = 'Apocalymbics';
        params[ 'parameters' ] = [
          [ 'device:nikkis@desire', 'device:timo@desire' ]
        ];

        httprequest( {
          uri: '/api/1/actioninstance',
          method: "POST",
          form: params
        }, function( error, response, body ) {
          console.log( 'body: ' + body );
        } );
      }

    } );


  }
};