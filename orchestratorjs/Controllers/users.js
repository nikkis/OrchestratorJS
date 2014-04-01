ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );


// Database handlers
var UsersHandler = require( ROOT + '/Models/user.js' );
var USERS = new UsersHandler();

var DeviceHandler = require( ROOT + '/Models/devicesHandler' );
var DEVICE_HANDLER = new DeviceHandler();



var passport = require( 'passport' ),
	LocalStrategy = require( 'passport-local' ).Strategy;

var ORCHESTRATOR_CORE = null;


function userReturnObject( userModel ) {
	var retObject = {};
	if( userModel ) {
		retObject = {
			username: userModel.username,
			color: userModel.color
		};
	}
	if( config.admin_users.indexOf( userModel.username ) != -1 ) {
		retObject.admin = true;
	} else {
		retObject.admin = false;
	}
	return retObject;
}




function userDeviceReturnObj( deviceModel ) {
	return {
		identity: deviceModel.identity,
		username: deviceModel.username,
		bluetoothMAC: deviceModel.bluetoothMAC,
		deviceType: deviceModel.type,
		deviceName: deviceModel.name,
		capabilities: deviceModel.capabilities,
		lastEdited: deviceModel.lastSeen
	};	
}





module.exports = {

	initialize: function( orchestratorCore ) {
		ORCHESTRATOR_CORE = orchestratorCore;
	},


	login: function( req, res ) {

		var username = req.body[ 'username' ];
		var password = req.body[ 'password' ];

		USERS.verifyUser( username, password, function( err, user ) {

			if ( user == null || !user || !user.username || user.username != username ) {
				res.send( 401, 'unauthorized' );
				return;
			}

			// initialize session

			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify( {
					'user': userReturnObject( user )
				} )
			);
			res.end();

		} );
	},



	logout: function( req, res ) {

		var username = req.body[ 'username' ];

		// destroy session

		res.send( 'logged out' );
	},



	getUser: function( req, res ) {

		var username = req.params.username;

		USERS.findUser( username, function( err, user ) {

			if ( !user ) {
				res.send( 404, 'cannot find user ' + username );
				return;
			}


			DEVICE_HANDLER.findUserDevices( username, function( err, deviceModels ) {

				var returnDevices = [];
				if ( deviceModels ) {
					for( i in deviceModels )
						returnDevices.push( userDeviceReturnObj( deviceModels[ i ] ) );
				}


				res.writeHead( 200, {
					"Content-Type": "application/json"
				} );
				res.write(
					JSON.stringify( {
						user: userReturnObject( user ),
						devices: returnDevices
					} )
				);
				res.end();

			} );

		} );
	},



	// post is for registering
	postUser: function( req, res ) {

		var username = req.body[ 'username' ];
		var password = req.body[ 'password' ];

		USERS.findUser( username, function( err, user ) {

			if ( user ) {
				res.send( 422, 'reserved username' );
				return;
			}

			USERS.createUser( username, password, function( err, user ) {

				if ( err ) {
					res.send( 500, 'error while creating user: ' + err );
					return;
				}


				res.writeHead( 200, {
					"Content-Type": "application/json"
				} );
				res.write(
					JSON.stringify( {
						'user': userReturnObject( user )
					} )
				);
				res.end();


			} );

		} );
	},


	// put is for editing user
	putUser: function( req, res ) {
		var username = req.params.username;
		res.send( 'user edited!' );
	},


	deleteUser: function( req, res ) {
		var username = req.params.username;
		res.send( 'user deleted!' );
	},



	getDevice: function( req, res ) {
		//var identity     = req.params.deviceIdentity;
		var deviceName   = req.params.deviceName;
		var username     = req.params.username;
		var identity     = username + '@' + deviceName;
		DEVICE_HANDLER.findDevice(identity, function( err, device ) {
			
			if ( err ) {
				res.send( 500, 'cannot get device ' + err );
				return;
			}
			
			if ( !device ) {
				res.send( 404, 'cannot find device ' + identity );
				return;
			}

			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify(
					userDeviceReturnObj( device )
				)
			);
			res.end();
		});
	},

	postDevice: function( req, res ) {
		
		//var identity     = req.params.deviceIdentity;
		var deviceName   = req.params.deviceName;
		var username     = req.params.username;
		var identity     = username + '@' + deviceName;

		var bluetoothMAC = req.body['bluetoothMAC'] ? req.body['bluetoothMAC'] : '';
		var deviceType   = req.body['deviceType'];

		var capabilities = req.body['capabilities'];

		DEVICE_HANDLER.upsertDevice(identity, username, bluetoothMAC, deviceType, deviceName, capabilities, function( err, device ) {

			if ( err ) {
				log( 'Cannot create device: ' + err );
				res.send( 500, 'cannot post device ' + err );
				return;
			}
			log('device created');
			res.writeHead( 200, {
				"Content-Type": "application/json"
			} );
			res.write(
				JSON.stringify(
					userDeviceReturnObj( device )
				)
			);
			res.end();
		});
	},


	deleteDevice: function( req, res ) {
		var deviceName   = req.params.deviceName;
		var username     = req.params.username;
		var identity     = username + '@' + deviceName;

		log( 'removing device: ' + identity );
		DEVICE_HANDLER.removeDevice( identity, function( err, data ) {
			if( err ) {
				res.send('Cannot remove device: ' + err + '\n');
				return;
			}
			res.send('Device: ' + identity + ' removed\n');
			return;
		} );
	}



};







