ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );


//var fs = require('fs');
var fs = require( 'node-fs' );
var forever = require( 'forever-monitor' );


var OBSERVERS_PATH = ROOT + config.resources.observers;
var observers = {};
this.postObserverInstance = function( req, res ) {

	log( 'Starting new observer..' );

	var observerName = req.params.observerName;
	var observerPath = ROOT + config.resources.observers + observerName + '/';
	var filename = observerPath + observerName + '.js';

	fs.exists( filename, function( exists ) {
		if ( exists ) {

			if ( observers[ observerName ] ) {
				observers[ observerName ].stop();
				delete observers[ observerName ];
			}

			var child = new( forever.Monitor )( filename, {
				max: 3,
				silent: false,
				options: []
			} );

			child.on( 'exit', function() {
				log( observerName + ' exited' );
			} );

			child.on( 'error', function( err ) {
				log( observerName + ' caused error: ' + err );
				try {
					delete observers[ observerName ];
					res.send( observerName + ' caused error: ' + err );
				} catch ( error ) {}
			} );

			child.on( 'start', function( process, data ) {
				res.send( observerName + ' started\n' );
			} );

			observers[ observerName ] = child;
			observers[ observerName ].start();

			//res.send( observerName + ' started\n' );
		} else {
			res.send( observerName + ' does not exist\n' );
		}
	} );


};


this.deleteObserverInstance = function( req, res ) {

	log( 'Stopping observer..' );

	var observerName = req.params.observerName;
	if ( observers[ observerName ] ) {
		observers[ observerName ].stop();
		observers[ observerName ] = null;
		res.send( observerName + ' stopped\n' );
	} else {
		res.send( observerName + ' not running\n' );
	}
};


this.deleteObserverFile = function( req, res ) {
	log( 'Deleting observer file..' );

	var observerName = req.params.observerName;
	if ( observers[ observerName ] ) {
		observers[ observerName ].stop();
		observers[ observerName ] = null;
	}

	var observerPath = ROOT + config.resources.observers + observerName + '/';
	HELPERS.deleteFolderRecursive( observerPath );

	res.send( observerName + ' deleted' );

};



this.getObservers = function( req, res ) {

	var resObservers = [];
	var observersPath = ROOT + config.resources.observers;

	fs.readdir( observersPath, function( err, files ) {
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
				try {
					if ( fs.lstatSync( observersPath + file ).isDirectory() &&
						fs.lstatSync( observersPath + file + '/' + file + '.js' ).isFile() ) {

						var observerName = file;

						var o = {
							name: observerName,
							running: false
						};

						if ( observers[ observerName ] )
							o.running = true;

						resObservers.push( o );
					}
				} catch ( err ) {}
			}
		}

		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( {
				"observers": resObservers
			} )
		);
		res.end();

	} );
}


this.getObserverFile = function( req, res ) {
	var observerName = req.params.observerName;

	var observersPath = ROOT + config.resources.observers + observerName + '/' + observerName + '.js';

	fs.readFile( observersPath, 'binary', function( error, file ) {

		if ( error ) {
			res.writeHead( 404, {
				'Content-Type': 'text/plain'
			} );
			res.write( 'Observer ' + observerName + ' not found\n' );
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








