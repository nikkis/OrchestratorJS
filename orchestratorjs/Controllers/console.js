ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log
var config = require( ROOT + '/config.json' );

var fs = require( 'fs' );

var DeviceHandler = require( ROOT + '/Models/devicesHandler' );
var DEVICE_HANDLER = new DeviceHandler();

var ACTION_INSTANCE_DATA_HANDLER = new( require( ROOT + '/Models/actionInstanceData' ) );


this.showIndexView = function( req, res ) {
	res.render( 'index', {
		'locals': {
			'title': config.app_name,
			'marketingMode': config.web_console.marketing_mode,
			'hostName': config.server.host,
			'pubsubPort': config.services.ojsConsole.port,
		}
	} );




	
};


this.getActionMetadata = function( req, res ) {
	var actionName = req.params.actionName;
	log( 'metadata for: ' + actionName );
	ACTION_INSTANCE_DATA_HANDLER.findactionInstanceData( actionName, function( err, metadata ) {

		if ( err ) {
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( err + '\n' );
			res.end();
		} else if ( metadata == null || metadata == undefined || metadata.args == null || metadata.args == undefined ) {
			res.writeHead( 404, {
				"Content-Type": "application/json"
			} );
			res.write( 'No metadata found for ' + actionName );
			res.end();

		} else {

			var arguments = JSON.stringify( metadata.args );
			arguments = JSON.parse( arguments );

			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					'args': metadata.args
				} )
			);
			res.end();
		}
	} );
};



this.getActions = function( req, res ) {
	var actionsPath = ROOT + '/resources/actions/';
	fs.readdir( actionsPath, function( err, files ) {
		if ( err ) {
			log( err );
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( err + '\n' );
			res.end();
		} else {

			var fileNames = [];
			for ( var i = 0; i < files.length; i++ ) {
				var file = files[ i ];
				if ( file[ 0 ] == '.' || file.slice( -3 ) != '.js' || file == 'misc.js' ) {
					continue;
				}
				fileNames.push( file.replace( '.js', '' ) );
			}
			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					//'actions': fileNames.sort()
					'files': fileNames.sort()
				} )
			);
			res.end();
		}
	} );
};


this.getAction = function( req, res ) {
	var actionName = req.params.actionName;
	fs.readFile( ROOT + '/resources/actions/' + actionName + '.js', 'binary', function( error, file ) {

		if ( error ) {
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( error + '\n' );
			res.end();
		} else {
			res.writeHead( 200, {
				'Content-Type': 'text/plain'
			} );
			res.write( file, 'binary' );
			res.end();
		}
	} );

};



this.getCapabilities = function( req, res ) {
	fs.readdir( ROOT + config.resources.capabilities, function( err, files ) {
		if ( err ) {
			log( err );
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( err + '\n' );
			res.end();
		} else {

			var fileNames = [];
			for ( var i = 0; i < files.length; i++ ) {
				var file = files[ i ];
				if ( file[ 0 ] == '.' || file.slice( -3 ) != '.js' || file == 'misc.js' ) {
					continue;
				}
				fileNames.push( file.replace( '.js', '' ) );
			}
			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					//'capabilities': fileNames.sort()
					files: fileNames.sort(),
					capabilities: fileNames.sort(),
					deviceTypes: config.device_types
				} )
			);
			res.end();
		}
	} );
};


this.getCapability = function( req, res ) {
	var capabilityName = req.params.capabilityName;
	log( capabilityName );

	fs.readFile( ROOT + config.resources.capabilities + capabilityName + '.js', 'binary', function( error, file ) {
		if ( error ) {
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( error + '\n' );
			res.end();
		} else {
			res.writeHead( 200, {
				'Content-Type': 'text/plain'
			} );
			res.write( file, 'binary' );
			res.end();
		}
	} );

};



this.getDownloads = function( req, res ) {
	fs.readdir( ROOT + config.clients_path, function( err, files ) {
		if ( err ) {
			log( err );
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( err + '\n' );
			res.end();
		} else {

			var fileNames = [];
			for ( var i = 0; i < files.length; i++ ) {
				var file = files[ i ];
				if ( file[ 0 ] == '.' || file.slice( -4 ) != '.apk' ) {
					continue;
				}
				fileNames.push( file );
			}
			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					'client_app_names': fileNames.sort()
				} )
			);
			res.end();
		}
	} );
};



this.getDownload = function( req, res ) {
	var clientName = req.params.clientName;
	fs.readFile( ROOT + config.clients_path + clientName, 'binary', function( error, file ) {
		if ( error ) {
			res.writeHead( 500, {
				'Content-Type': 'text/plain'
			} );
			res.write( error + '\n' );
			res.end();
		} else {
			res.writeHead( 200, {
				'Content-Type': 'text/plain'
			} );
			res.write( file, 'binary' );
			res.end();
		}
	} );
};