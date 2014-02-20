'use strict';

/* Controllers */




var app = angular.module( 'ojsConsole.controllers', [] );



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






