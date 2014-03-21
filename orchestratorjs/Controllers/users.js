ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );

var UsersHandler = require( ROOT + '/Models/user.js' );
var USERS = new UsersHandler();



var passport = require( 'passport' ),
	LocalStrategy = require( 'passport-local' ).Strategy;


function userReturnObject( userModel ) {
	return {
		username: userModel.username
	};
}


module.exports = {

	userSerializer: function(user, done) {
  	done(null, 'user.id');
	},

	userDeserializer: function( username, next ) {

		USERS.findUser( username, function( err, user ) {
			next( err, user );
		} );
	},


	getAuthStrategy: function() {

		return new LocalStrategy( function( username, password, next ) {

			USERS.verifyUser( username, password, function( err, user ) {
				if ( !user )
					return next( null, false, {
						message: 'cannot authenticate.'
					} );
				else
					return next( null, user );
			} );
		} );
	},



	login: function( req, res ) {

		var username = req.body[ 'username' ];
		var password = req.body[ 'password' ];

		USERS.verifyUser( username, password, function( err, user ) {

			if ( !user )
				res.send( 401, 'unauthorized' );

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

			if ( !user )
				res.send( 404, 'cannot find user ' + username );

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



	// post is for registering
	postUser: function( req, res ) {

		var username = req.body[ 'username' ];
		var password = req.body[ 'password' ];

		USERS.findUser( username, function( err, user ) {

			if ( user )
				res.send( 422, 'reserved username' );

			USERS.createUser( username, password, function( err, user ) {

				if ( err )
					res.send( 500, 'error while creating user: ' + err );


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
	}

};