//var app = angular.module( 'ojsConsole.controllers.UsersController', [ 'ojsConsole.services', 'ojsConsole.services.SocketIOService' ] );
var app = angular.module( 'ojsConsole.controllers.userControllers', [] );

app.controller( 'UsersController',
	function( $scope, socket ) {


		/*
		// listen changes in metadata and update view accordingly
		socket.on('ojs_context_data', function ( message ) {
			for ( i in $scope.devices ) {
				if ( $scope.devices[ i ].identity == message.deviceIdentity ) {
					if( message.key == 'online' )
						$scope.devices[ i ].online = message.value;
					else
						$scope.devices[ i ].metadata[ message.key ] = message.value;
				}
			}
		});

		socket.on('ojs_log_', function ( deviceIdentity, message ) {
			console.log( deviceIdentity+': ' + message );
		});

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$.getJSON( '/api/' + apiVersion + '/devices', function( data ) {
			$scope.capabilities = data.capabilities;
			$scope.metadataFields = data.metadataFields;
			$scope.devices = data.devices;
			$scope.$apply();
		} );
*/


	}
);



app.controller( 'SignInController',
	function( $scope ) {
		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();
		console.log( 'in' );
		$scope.singInSubmit = function() {
			console.log( 'submitting' );
			console.log( $scope.username );
			console.log( $scope.password );

		};
	}
);


app.controller( 'SignOutController',
	function( $scope ) {
		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();
		console.log( 'out' );
	}
);


app.controller( 'SignUpController',
	function( $scope ) {
		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();
		console.log( 'up' );

		$scope.singUpSubmit = function() {
			console.log( 'submitting' );
			console.log( $scope.username );
			console.log( $scope.password );

		};

	}
);