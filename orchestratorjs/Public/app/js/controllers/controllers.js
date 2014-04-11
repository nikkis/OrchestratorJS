'use strict';

/* Controllers */



var app = angular.module( 'ojsConsole.controllers', [] );


// The whole web app controller, not for managing AcOP apps
app.controller( 'AppController',
	// initializes auth service
	function( $scope, AuthService ) {}
);



app.controller( 'HomeController',
	function( $scope, $location, $http, UserService, AuthService ) {

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


			if ( UserService.isLogged ) {
				console.log( 'user logged' );
			} else {
				console.log( 'user NOOOT logged' );
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
app.controller( 'ActionsController',
	function( $scope ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).hide();

		showActions();

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
*/
