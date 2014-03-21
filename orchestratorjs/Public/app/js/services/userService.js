

var app = angular.module( 'ojsConsole.services.UserService', [] );



app.factory('UserService', [function( $rootScope ) {
	var sdo = {
		isLogged: false,
		username: ''
	};
	return sdo;
}]);

