var app = angular.module( 'ojsConsole.controllers.ObserversController', [ 'ojsConsole.services' ] );

app.controller( 'ObserversController',
	function( $scope, $http ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		console.log( 'ObserversController' );


		$.getJSON( '/api/' + apiVersion + '/observers', function( data ) {
			$scope.editType = 'observer';
			$scope.observerFilesTemplate = 'app/partials/observerNames.html';

			$scope.observerInstances = data.observers;



			$scope.stopObserver = function( observerName ) {
				$http.delete( '/api/' + apiVersion + '/observer/' + observerName + '/instance' ).success( function( data, status, headers, config ) {
					console.log( 'stop status: ' + data );
				} );
			};

			$scope.startObserver = function( observerName ) {
				$http.post( '/api/' + apiVersion + '/observer/' + observerName + '/instance' ).success( function( data, status, headers, config ) {
					console.log( 'start status: ' + data );
				} );
			};

			$scope.editObserver = function( observerName ) {

			};



			$scope.$apply();
		} );

	}
);

app.controller( 'ObserverEditController',
	function( $scope, $http, $routeParams ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		$scope.enableCodeEdit = function() {
			editAreaLoader.execCommand( 'code_area', 'set_editable', !editAreaLoader.execCommand( 'code_area', 'is_editable' ) );
			if ( editAreaLoader.execCommand( 'code_area', 'is_editable' ) ) {
				$( '.myEditIcon' ).removeClass( 'fi-page-edit' );
				$( '.myEditIcon' ).addClass( 'fi-lock' );

				$( '.fileNameEdit' ).show();
				$( '.myRemoveIcon' ).show();

			} else {
				$( '.myEditIcon' ).removeClass( 'fi-lock' );
				$( '.myEditIcon' ).addClass( 'fi-page-edit' );
				$( '.fileNameEdit' ).hide();
				$( '.myRemoveIcon' ).hide();
			}
		};

		var observerName = $routeParams.observerName;
		console.log( observerName );
		$.ajax( {
			type: 'GET',
			url: '/api/' + apiVersion + '/observer/' + observerName,
		} ).done( function( data ) {

			$scope.fileName = observerName;
			$scope.code = data;

			initEditor();

			$scope.stopObserver = function( observerName ) {
				$http.delete( '/api/' + apiVersion + '/observer/' + observerName + '/instance' ).success( function( data, status, headers, config ) {
					console.log( 'stop status: ' + data );
					alert( data );
				} );
			};

			$scope.startObserver = function( observerName ) {
				$http.post( '/api/' + apiVersion + '/observer/' + observerName + '/instance' ).success( function( data, status, headers, config ) {
					console.log( 'start status: ' + data );
					alert( data );
				} );
			};

			$scope.$apply();
		} );


	}
);










