var port = parseInt( process.argv[ 2 ] );

function log( line ) {
	console.log( 'ojsConsole service# ' + line );
}
log( 'port is ' + port );



var io = require('socket.io').listen( port );


io.sockets.on( 'connection', function( socket ) {


	// log messages
	socket.on( 'ojs_log', function( actionId, deviceIdentity, messageStr ) {
		// emit log message for browsers
		log( 'WUUHUU 1' );
		socket.broadcast.emit( 'ojs_log_' + actionId, deviceIdentity, messageStr );
	} );


	// context changes
	socket.on( 'ojs_context_data', function( contextDataContents ) {
		// emit for browsers, see ojsDeviceRegistry service emit for observers
		socket.broadcast.emit( 'ojs_context_data', contextDataContents );
	} );



	socket.on( 'disconnect', function( deviceid ) {} );

} );



