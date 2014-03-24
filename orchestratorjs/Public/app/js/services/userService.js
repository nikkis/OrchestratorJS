var app = angular.module( 'ojsConsole.services.UserService', [] );


app.factory( 'UserService', [ '$rootScope',
	function( $rootScope ) {

		var sdo = {
			isLogged: false,
			username: ''
		};
		return sdo;
	}
] );