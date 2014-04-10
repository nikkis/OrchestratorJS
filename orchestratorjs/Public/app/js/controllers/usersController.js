var app = angular.module( 'ojsConsole.controllers.userControllers', [ 'ojsConsole.services', 'ojsConsole.services.UserService', 'ojsConsole.services.AuthService' ] );



// Manage user profile and user's devices
app.controller( 'UserController',
	function( $scope, $location, $routeParams, $http, UserService ) {

		var username = $routeParams.username;

		$scope.UserService = UserService;

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		console.log( 'profile page for user: ' + UserService.username );

		$http.get( '/api/' + apiVersion + '/user/' + username ).success( function( data, status, headers, config ) {
			$scope.user         = data.user;
			$scope.user.devices = data.devices;
		} );

		$scope.removeDevice = function( deviceName ) {
			console.log('removing: ' + deviceName);
			removeDevice( deviceName, $scope, $http );
		};



	}
);


function removeDevice( deviceName, $scope, $http ) {
	if ( !$scope.UserService.isLogged || !$scope.UserService.username ) {
		alert( 'Sign in first!' );
		return;
	}

	var deviceId = $scope.UserService.username + '@' + deviceName;
	var retVal = confirm( 'Are you sure you want remove device ' + deviceId + '?' );
	if ( retVal == true ) {
		$http.delete( '/api/' + apiVersion + '/user/' + $scope.UserService.username + '/device/' + deviceName ).success( function( data, status, headers, config ) {
			alert( data );
		} ).error( function( data, status, headers, config ) {
			alert( data );
		} );
	}
}










// For creating / editing user device and its settings
app.controller( 'UserDeviceController',
	function( $scope, $location, $routeParams, $http, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		$scope.UserService = UserService;

		// !!this username must come from UserService!!
		//var username = $routeParams.username;
		var username = UserService.username;
		$scope.device = {};
		var deviceName = $routeParams.deviceName == 'newDevice' ? '' : $routeParams.deviceName;

		// ensure init after the page/template has been loaded
		$scope.$on( '$viewContentLoaded', function() {

			$http.get( '/api/' + apiVersion + '/devices' ).success( function( data, status, headers, config ) {
				$scope.capabilities = data.capabilities;
			} );
		} );


		$scope.device.deviceTypeNames = {};
		$scope.device.capabilities = {};
		$http.get( '/api/' + apiVersion + '/capability' ).success( function( data2, status, headers, config ) {


			if ( deviceName ) {
				// load details from server

				$http.get( '/api/' + apiVersion + '/user/' + username + '/device/' + deviceName, {
					username: UserService.username,
				} ).success( function( data, status, headers, config ) {
					console.log( data );


					$scope.device.deviceIdentity = data.identity;
					$scope.device.username = data.username;
					$scope.device.deviceName = data.deviceName;
					$scope.device.bluetoothMAC = data.bluetoothMAC;
					var capabilities = data.capabilities;

					for ( i in data2.capabilities ) {
						console.log( capabilityName );
						var capabilityName = data2.capabilities[ i ];
						if ( capabilities.indexOf( capabilityName ) != -1 )
							$scope.device.capabilities[ capabilityName ] = true;
						else
							$scope.device.capabilities[ capabilityName ] = false;
					}

					$scope.device.deviceTypeNames = data2.deviceTypes;
					for ( i in data2.deviceTypes ) {
						var deviceTypeName = data2.deviceTypes[ i ];
						if ( data.deviceType == deviceTypeName )
							$scope.device.deviceType = deviceTypeName;
					}

				} );

				// new device
			} else {
				$scope.device.username = UserService.username;

				for ( i in data2.capabilities ) {
					var capabilityName = data2.capabilities[ i ];
					$scope.device.capabilities[ capabilityName ] = false;
				}

				$scope.device.deviceTypeNames = data2.deviceTypes;

			}


		} );

		$scope.removeDevice = function() {
			removeDevice( $scope.device.deviceName, $scope, $http );
/*
			if ( !$scope.UserService.isLogged || !$scope.UserService.username ) {
				alert( 'Sign in first!' );
				return;
			}

			var deviceId = $scope.device.username + '@' + $scope.device.deviceName;
			var retVal = confirm( 'Are you sure you want remove device ' + deviceId + '?' );
			if ( retVal == true ) {
				$http.delete( '/api/' + apiVersion + '/user/' + $scope.UserService.username + '/device/' + $scope.device.deviceName ).success( function( data, status, headers, config ) {
					alert( data );
				} ).error( function( data, status, headers, config ) {
					alert( data );
				} );
			}
*/
		};


		$scope.submitDevice = function() {

			var deviceId = $scope.device.username + '@' + $scope.device.deviceName;
			var capabilities = [];

			if ( !$scope.UserService.isLogged || !$scope.UserService.username ) {
				alert( 'Sign in first!' );
				return;
			}

			for ( capabilityName in $scope.device.capabilities ) {
				if ( $scope.device.capabilities[ capabilityName ] == true ) {
					capabilities.push( capabilityName );
				}
			}

			if ( !$scope.device.deviceType ) {
				alert( 'Set device type!' );
				return;
			}

			$http.post( '/api/' + apiVersion + '/user/' + username + '/device/' + $scope.device.deviceName, {
				bluetoothMAC: $scope.device.bluetoothMAC,
				deviceName: $scope.device.name,
				deviceType: $scope.device.deviceType,
				capabilities: capabilities
			} ).success( function( data, status, headers, config ) {
				alert( 'Settings saved!' );
			} ).error( function( data, status, headers, config ) {
				alert( 'Cannot save settings: ' + data );
			} );



		};

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