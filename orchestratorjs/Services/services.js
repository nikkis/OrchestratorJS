var forever = require( 'forever-monitor' );

ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log
var config = require( ROOT + '/config.json' );

var services = {};
var pathPrefix = ROOT + '/Services/';


this.initializeServices = function() {

	// Device Registry
	if ( config.services.ojsDeviceRegistry.enabled ) {
		var serviceName = 'ojsDeviceRegistry';
		var servicePort = parseInt( config.services.ojsDeviceRegistry.port );
		var allowDebug = config.services.ojsDeviceRegistry.debug;

		startServiceProcess( serviceName, servicePort, allowDebug );
	}


	// Log
	if ( config.services.ojsConsole.enabled ) {
		var serviceName = 'ojsConsole';
		var servicePort = parseInt( config.services.ojsConsole.port );
		var allowDebug = config.services.ojsConsole.debug;

		startServiceProcess( serviceName, servicePort, allowDebug );

	}

}






function startServiceProcess( serviceName, servicePort, allowDebug ) {
	var filename = pathPrefix + serviceName + '.js';

	var child = new( forever.Monitor )( filename, {
		max: 3,
		silent: false,
		options: [ servicePort, allowDebug ]
	} );

	child.on( 'exit', function() {
		log( serviceName + ' exited' );
	} );

	child.on( 'error', function( err ) {
		log( serviceName + ' caused error: ' + err );
		try {
			delete services[ serviceName ];
			log( serviceName + ' caused error: ' + err );
		} catch ( error ) {}
	} );

	child.on( 'start', function( process, data ) {
		log( serviceName + ' started\n' );
	} );

	services[ serviceName ] = child;
	services[ serviceName ].start();
}