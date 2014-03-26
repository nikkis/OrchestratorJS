ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );
var util = require( 'util' );

var AppSettingsHandler = require( ROOT + '/Models/appSettings.js' );
var APP_SETTINGS = new AppSettingsHandler();

var AppsHandler = require( ROOT + '/Models/app.js' );
var APPS = new AppsHandler();

//var fs = require('fs');
var fs = require( 'node-fs' );
var forever = require( 'forever-monitor' );


var APPS_PATH = ROOT + config.resources.apps;
var apps = {};


// Not for app SETTINGS! and not for app INSTANCE!!
function appInfoReturnDict( appModel ) {
	if( !appModel )
		return {};

	return {
		appName: appModel.appName,
		author: appModel.author,
		color: appModel.color,
		img: appModel.img,
		desc: appModel.desc
	};
}


this.postAppInstance = function( req, res ) {

	log( 'Starting new app..' );

	var username = req.params.username;
	var appName = req.params.appName;
	var appPath = ROOT + config.resources.apps + appName + '/';
	var filename = appPath + appName + '.js';

	loadAppSettings( username, appName, function( err, appInfo ) {

		log( 'filename: ' + filename );
		// dumps user specified app
		var appModule = HELPERS.reRequire( filename );

		appModule.settings = appInfo.settings;



		var tempContents = '';
		var lines = require( 'fs' ).readFileSync( filename ).toString().split( /\r?\n/ );
		for ( i in lines ) {
			if ( lines[ i ].indexOf( 'module.exports' ) != -1 )
				break;
			else
				tempContents += ( lines[ i ] + '\n' );
		}

		tempContents += 'var TheAppModule =  module.exports = {\n\n';

		tempContents += ( 'settings: ' + JSON.stringify( appInfo.settings ) + ',\n\n' );
		tempContents += ( 'logic: ' + appModule.logic.toString() + '\n\n' );

		tempContents += ( '};\n\n' );

		tempContents += ( 'var settings = ' + JSON.stringify( appInfo.settings ) + ';\n\n' );
		tempContents += ( 'TheAppModule.logic();' );

		log( tempContents );

		var userSpecifiedAppName = HELPERS.md5( username + appName ) + '.js';

		filename = appPath + userSpecifiedAppName;
		HELPERS.saveFileNoRequire( appPath + userSpecifiedAppName, tempContents, function() {

			fs.exists( filename, function( exists ) {
				if ( exists ) {
					if ( apps[ appName ] ) {
						apps[ appName ].stop();
						delete apps[ appName ];
					}

					var child = new( forever.Monitor )( filename, {
						max: 3,
						silent: false,
						options: []
					} );

					child.on( 'exit', function() {
						log( appName + ' exited' );
					} );

					child.on( 'error', function( err ) {
						log( appName + ' caused error: ' + err );
						try {
							delete apps[ appName ];
							res.send( appName + ' caused error: ' + err );
						} catch ( error ) {}
					} );

					child.on( 'start', function( process, data ) {
						res.send( appName + ' started\n' );
					} );

					apps[ appName ] = child;
					apps[ appName ].start();

					//res.send( appName + ' started\n' );
				} else {
					res.send( appName + ' does not exist\n' );
				}
			} );

		} );


	} );

};



this.getAppInfo = function( req, res ) {

	var author = req.params.username;
	var appName = req.params.appName;

	APPS.findApp( appName, function( err, data ) {
		if ( err ) {
			res.send( 500, 'Error: ' + err );
			return;
		}

		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( 
				appInfoReturnDict( data )
			)
		);
		res.end();

	} );
};


this.postAppInfo = function( req, res ) {

	var author = req.params.username;
	var appName = req.params.appName;
	var appDesc = req.body[ 'appDesc' ];
	log('appDesc: ' + appDesc);

	// yet only modifies desc..
	APPS.modifyApp( appName, author, appDesc, function( err, data ) {
		if ( err ) {
			res.send( 500, 'Error: ' + err );
			return;
		}

		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( 
				appInfoReturnDict( data )
			)
		);
		res.end();

	} );
};



this.postAppSettings = function( req, res ) {

	var username = req.params.username;
	var appName = req.params.appName;
	var settings = req.body[ 'settings' ];

	APP_SETTINGS.upsertAppSettings( username, appName, settings, function( err, data ) {
		if ( err ) {
			res.send( 500, 'Error: ' + err );
			return;
		}

		var returnDict = {
			appName: data.appName,
			username: data.username,
			settings: data.settings
		};
		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( {
				"settings": returnDict
			} )
		);
		res.end();
	} );
};


function loadAppSettings( username, appName, next ) {

	var appModel = {
		name: appName,
		settings: {}
	};
	var error = null;

	APP_SETTINGS.findAppSettings( username, appName, function( err, data ) {
		try {


			var appPath = ROOT + config.resources.apps + appName + '/';
			var fullpath = appPath + appName + '.js';

			var appModule = HELPERS.reRequire( fullpath );

			if ( appModel && appModel.settings ) {

				appModel.settings = appModule.settings;
				for ( key in appModel.settings ) {
					if ( data && data.settings && data.settings[ key ] )
						appModel.settings[ key ] = data.settings[ key ];
				}
			}
		} catch ( err ) {
			error = err;
		}

		next( error, appModel );

	} );

};


this.getAppSettings = function( req, res ) {

	log( 'Getting app model..' );

	var appName = req.params.appName;
	var username = req.params.username;

	loadAppSettings( username, appName, function( err, appSettings ) {

		if ( err )
			res.send( 404, 'Cannot find module.' );

		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( appSettings )
		);
		res.end();
	} );

};

this.deleteAppInstance = function( req, res ) {

	log( 'Stopping app..' );

	var appName = req.params.appName;
	if ( apps[ appName ] ) {
		apps[ appName ].stop();
		apps[ appName ] = null;
		res.send( appName + ' stopped\n' );
	} else {
		res.send( appName + ' not running\n' );
	}
};


this.deleteAppFile = function( req, res ) {
	log( 'Deleting app file..' );

	var appName = req.params.appName;
	if ( appName == 'newApp' ) {
		res.send( 'OK' );
		return;
	}

	if ( apps[ appName ] ) {
		apps[ appName ].stop();
		apps[ appName ] = null;
	}

	var appPath = ROOT + config.resources.apps + appName + '/';
	HELPERS.deleteFolderRecursive( appPath );

	res.send( appName + ' deleted' );

};


this.postAppFile = function( req, res ) {
	var username = req.params.username;
	log( username + ' posting ne app' );
	var appName = req.params.appName;


	APPS.findApp( appName, function( err, appModel ) {

		if ( appModel && appModel.author != username ) {
			res.send( 422, 'reserved app name' );
			return;
		}



		APPS.createApp( appName, username, function( err, user ) {

			if ( err ) {
				res.send( 500, 'cannot save app: ' + err );
				return;
			}

			var body = '';
			var appPath = ROOT + config.resources.apps + appName + '/';
			fs.mkdir( appPath, 0777, true, function( err ) {
				if ( err ) {
					log( 'Cannot create folder: ' + appPath );
					throw new Error( 'Error while creting folder: ' + appPath );
				}

				req.on( 'data', function( data ) {
					body += data;
				} );

				req.on( 'end', function() {
					var POST = body;
					HELPERS.saveFileNoRequire( appPath + appName + '.js', POST );
				} );
				res.send( 'OK' );
			} );


		} );


	} );

};



this.getApps = function( req, res ) {

	var resApps = [];
	var appsPath = ROOT + config.resources.apps;


	APPS.findAllApps( function( err, appModels ) {

		fs.readdir( appsPath, function( err, files ) {
			if ( err ) {
				log( err );
				res.writeHead( 500, {
					'Content-Type': 'text/plain'
				} );
				res.write( err + '\n' );
				res.end();
				return;
			} else {
				var fileNames = [];
				for ( var i = 0; i < files.length; i++ ) {
					var file = files[ i ];
					try {
						if ( fs.lstatSync( appsPath + file ).isDirectory() &&
							fs.lstatSync( appsPath + file + '/' + file + '.js' ).isFile() ) {

							var appName = file;
							if ( appName == 'newApp' )
								continue;

							var o = {
								name: appName,
								running: false
							};

							if ( apps[ appName ] )
								o.running = true;

							// load app details
							for ( k in appModels ) {
								if( appModels[ k ].appname == appName ) {
									o.desc = appModels[ k ].desc;
									o.author = appModels[ k ].author;
									o.color = appModels[ k ].color;
									o.img = appModels[ k ].img;
								}
							}


							resApps.push( o );
						}
					} catch ( err ) {}
				}
			}

			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					"apps": resApps
				} )
			);
			res.end();

		} );


	} );


}


this.getAppFile = function( req, res ) {
	var appName = req.params.appName;

	var appsPath = ROOT + config.resources.apps + appName + '/' + appName + '.js';

	fs.readFile( appsPath, 'binary', function( error, file ) {

		if ( error ) {
			res.writeHead( 404, {
				'Content-Type': 'text/plain'
			} );
			res.write( 'App ' + appName + ' not found\n' );
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