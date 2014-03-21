'use strict';

/* Controllers */



var app = angular.module( 'ojsConsole.controllers', [] );


app.controller( 'HomeController',
	function( $scope, $location, $http, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		$( document ).ready( function() {
			var options = {
				autoPlay: true,
				nextButton: true,
				prevButton: true,
				preloader: true,
				navigationSkip: true,
			};
			var sequence = $( "#sequence" ).sequence( options ).data( "sequence" );


if(UserService.isLogged) {
	console.log('user logged');
}
else{
	console.log('user NOOOT logged');
}

			sequence.afterLoaded = function() {
				$( ".sequence-prev, .sequence-next" ).fadeIn( 500 );
			}
		} );

	}
);


app.controller( 'DocsController',
	function( $scope ) {
		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();
	}
);


/*
// moved to its own file
app.controller( 'DevicesController',
	function( $scope ) {

		// non-angular version
		//$( '.non-angular-container' ).html( '' );
		//$( '.angular-container' ).hide();
		//showDevices();

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
*/


app.controller( 'ActionsController',
	function( $scope ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).hide();

		showActions();

	}
);


app.controller( 'ActionInstancesController',
	function( $scope ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).hide();

		showInstances();
	}
);


app.controller( 'CapabilitiesController',
	function( $scope ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).hide();

		showCapabilities();
	}
);


app.controller( 'CapabilitiesController',
	function( $scope ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).hide();

		showCapabilities();
	}
);