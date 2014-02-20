var port = parseInt( process.argv[ 2 ] );
var allowDebug = process.argv[ 3 ];

function log( line ) {
	console.log( 'ojsDeviceRegistryPubSub# ' + line );
}
log( 'port is ' + port );
log( 'allowDebug: ' + allowDebug);

var io = require('socket.io').listen( port );

if ( allowDebug !== 'true' )
	io.set('log level', 0);

io.sockets.on( 'connection', function( socket ) {

	// context changes
	socket.on( 'ojs_context_data', function( contextDataContents ) {
		// emit for observers, format: contextDataKey, contextDataValue, deviceIdentity
		log( contextDataContents.key+', '+contextDataContents.value+': '+contextDataContents.deviceIdentity );
		socket.broadcast.emit( contextDataContents.key, contextDataContents.value, contextDataContents.deviceIdentity );
	} );


	socket.on( 'disconnect', function( deviceid ) {} );

} );



