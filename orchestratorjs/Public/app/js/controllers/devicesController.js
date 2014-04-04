var app = angular.module( 'ojsConsole.controllers.DevicesController', [ 'ojsConsole.services', 'ojsConsole.services.SocketIOService' ] );


function blinkCell( deviceIdentity, metadataKey ) {
	var className = '.'+deviceIdentity.replace('@','AT')+'_'+metadataKey;

console.log(className);

	$(className).addClass('blinkClass');
	$(className).bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function (e) {
	  $(className).removeClass('blinkClass');
	});
}


app.controller( 'DevicesController',
	function( $scope, socket ) {

		// listen changes in metadata and update view accordingly
		socket.on('ojs_context_data', function ( message ) {
			for ( i in $scope.devices ) {
				if ( $scope.devices[ i ].identity == message.deviceIdentity ) {
					if( message.key == 'online' ) {
						$scope.devices[ i ].online = message.value;
						if( message.value )
							blinkCell( message.deviceIdentity, message.key );
					 } else {
						$scope.devices[ i ].metadata[ message.key ] = message.value;
						blinkCell( message.deviceIdentity, message.key );
					}

				}
			}
		});

/*
$scope.testClick = function() {
	console.log('adding blink!!');
	blinkCell('nikkis@s3mini','online');
};
*/

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