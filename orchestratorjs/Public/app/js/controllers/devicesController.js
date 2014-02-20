var app = angular.module( 'ojsConsole.controllers.DevicesController', [ 'ojsConsole.services', 'ojsConsole.services.SocketIOService' ] );


app.controller( 'DevicesController',
	function( $scope, socket ) {

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

	}
);