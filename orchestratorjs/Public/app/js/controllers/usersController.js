//var app = angular.module( 'ojsConsole.controllers.UsersController', [ 'ojsConsole.services', 'ojsConsole.services.SocketIOService' ] );
var app = angular.module( 'ojsConsole.controllers.userControllers', [ 'ojsConsole.services', 'ojsConsole.services.UserService', 'ojsConsole.services.AuthService' ] );

app.controller( 'UserController',
	function( $scope, $location, $http, UserService ) {

		$scope.UserService = UserService;

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		console.log( 'profile page for user: ' + UserService.username );

	}
);



app.controller( 'SignInController',
	function( $scope, $location, $http, $rootScope, UserService ) {


		console.log( 'SignInController' );

		$scope.UserService = UserService;

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$scope.keyPressed = function( e ) {
			var code = ( e.keyCode ? e.keyCode : e.which );

			if ( code == 13 ) { // 'Enter' keycode
				$scope.signInSubmit();
				e.preventDefault();
			}
		}

		$scope.signInSubmit = function() {
			console.log( 'submitting' );
			console.log( $scope.user.username );
			console.log( $scope.user.password );

			$http.post( '/api/' + apiVersion + '/logIn/', {
				username: $scope.user.username,
				password: $scope.user.password
			} ).success( function( data, status, headers, config ) {

				if ( status ) {

					// succefull login
					UserService.isLogged = true;
					UserService.username = data.user.username;
					UserService.color = data.user.color;

					if ( $rootScope.nextPath ) {
						$location.path( $rootScope.nextPath );
					} else {
						$location.path( '/' );
					}


				} else {
					UserService.isLogged = false;
					UserService.username = '';
					//$location.path( '/signIn' );
					alert( 'wrong username and/or password!' );
				}


			} ).error( function( data, status, headers, config ) {

				UserService.isLogged = false;
				UserService.username = '';
				//$location.path( '/signIn' );
				alert( 'wrong username and/or password!' );

			} );
		};
	}
);



app.controller( 'SignOutController',
	function( $scope, $location, $http, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		if ( UserService.isLogged ) {
			$http.post( '/api/' + apiVersion + '/logOut/', {
				username: UserService.username,
			} ).success( function( data, status, headers, config ) {} );


			UserService.isLogged = false;
			UserService.username = '';
		}

		$( '.userMenuItem' ).html( MenuItem_singIn );
		$location.path( '/' );

	}
);


app.controller( 'SignUpController',
	function( $scope, $location, $http, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$scope.keyPressed = function( e ) {
			var code = ( e.keyCode ? e.keyCode : e.which );

			if ( code == 13 ) {
				$scope.signUpSubmit();
				e.preventDefault();
			}
		}

		$scope.signUpSubmit = function() {

			$http.post( '/api/' + apiVersion + '/user/', {
				username: $scope.user.username,
				password: $scope.user.password
			} ).success( function( data, status, headers, config ) {
				console.log( 'succees: ' + data );

				//$location.path( '/user/' + $scope.user.username );
				$location.path( '/signIn' );

			} ).error( function( data, status, headers, config ) {
				console.log( 'error: ' + data );
				alert( data );
			} );

		};

	}
);