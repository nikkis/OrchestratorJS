var app = angular.module( 'ojsConsole.services.UserService', [] );


app.factory( 'UserService', [ '$rootScope',
	function( $rootScope ) {
		
		// hack! sorry..
		$('.user-menu-controls').show();
		var sdo = {
			isLogged: false,
			username: ''
		};
		return sdo;
	}
] );