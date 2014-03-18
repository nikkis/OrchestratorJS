ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );


var Fiber = require( 'fibers' );

this.sleep = function( seconds ) {
	var fiber = Fiber.current;
	setTimeout( function() {
		fiber.run();
	}, seconds * 1000 );
	Fiber.yield();
}

this.getUser = function() {
	return 'nikkis@gadgeteer';
};

this.pubsub = function() {
	return require( 'socket.io-client' ).connect( 'http://' + config.server.host + ':' + config.services.ojsDeviceRegistry.port );
};



this.httprequest = function( detailsDict, next ) {
	var httprequest = require( "request" );
	return httprequest( {
			uri: 'http://' + config.server.host + ':' + config.server.port + detailsDict.uri,
			method: detailsDict.method,
			form: detailsDict.form
		}, next );


};