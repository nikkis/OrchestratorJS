ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log
var config = require( ROOT + '/config.json' );
var httprequest = require( "request" );

runYieldHelpers = require( ROOT + '/helpers/helperForRunYield.js' );


this.StartAction = function( actionName, actionParameters ) {


try {
  log( 'misc - triggering action from action: ' + actionName );

  var params = {};
  params[ 'actionName' ] = actionName;
  params[ 'parameters' ] = actionParameters;


  httprequest( {
    uri: 'http://localhost:' + config.server.port + '/api/' + config.api + '/actioninstance',
    method: "POST",
    form: params

  }, function( error, response, body ) {
    log( 'body: '+body );
  } );

  log( 'paapaaa' );

}catch(err){
  log('misc start action error: '+err);
}

  /*
        type: 'POST',
        url: '/api/' + apiVersion + '/actioninstance',
        contentType: 'application/json',
        data: JSON.stringify( pp ),
*/
  /*

    var options = {
        host: 'localhost:'+config.server.port,
        path: '/api/' + 1 + '/actioninstance',
//        port: '1337',
        method: 'POST'
    };

    callback = function( response ) {
        var str = ''
        response.on( 'data', function( chunk ) {
            str += chunk;
        } );

        response.on( 'end', function() {
            console.log( str );
        } );
    }

    var req = http.request( options, callback );
    //This is the data we are posting, it needs to be a string or a buffer
    req.write( "hello world!" );
    req.end();
*/



};

this.sleep = function( ms ) {

  var Fiber = require( 'fibers' );
  var sleepResponseArgs = {
    runRetType: runYieldHelpers.SLEEP_TIMEOUT
  };

  var runRet = null;
  var runRetType = null;
  while ( runRetType != sleepResponseArgs[ 'runRetType' ] ) {
    try {
      var fiber = Fiber.current;
      setTimeout( function() {
        if ( fiber !== undefined ) {
          fiber.run( sleepResponseArgs );
        }
      }, ms * 1000 );
      runRet = Fiber.yield();
      console.log( 'yield off' );
      console.log( runRet );
      if ( runRet[ 'runRetType' ] ) {
        runRetType = runRet[ 'runRetType' ];
      }
    } catch ( err ) {
      log( err );
    }
  }
};



this.waitFor = function( responseStrTowait ) {
  this.waitForStr = responseStrTowait;
  var resVal = 'asdf-asdf--asf-_sdfasdf';
  while ( resVal != this.waitForStr ) {
    try {
      resVal = Fiber.yield();
    } catch ( err ) {
      console.log( err );
    }
  }
  console.log( 'no more waiting, got: ' + resVal );
}