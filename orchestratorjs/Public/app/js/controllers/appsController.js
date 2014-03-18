var app = angular.module( 'ojsConsole.controllers.AppsController', [ 'ojsConsole.services' ] );



function startApp( $http, $scope, appName ) {

	var username = 'nikkis';

	//var appName = $scope.fileName;
	if( appName == 'newApp' ) {
		alert('You need to save your app first!\n( name newApp is reserved )');
		return;
	}

	// get list of required settings and possible previously saved settings
	$http.get( '/api/' + apiVersion + '/user/' + username + '/app/' + appName + '/settings' ).success( function( data, status, headers, config ) {

		var settings = {};
		if ( data && data && data.settings && data.settings.length != 0 ) {
			for ( key in data.settings ) {
				var oldValue = data.settings[ key ];
				var temp = prompt( "Please parameter " + key, oldValue );
				if( !temp ) {
					alert('All settings need to be given!');
					return;
				}
				else {
					settings[ key ] = temp;
				}
			}

			// save new settings for user
			$http.post( '/api/' + apiVersion + '/user/' + username + '/app/' + appName + '/settings', {
				'settings': settings
			} ).success( function( data, status, headers, config ) {

				// start app
				$http.post( '/api/' + apiVersion + '/user/' + username + '/app/' + appName + '/instance' ).success( function( data, status, headers, config ) {
					console.log( 'start status: ' + data );
					alert( data );
					for ( i in $scope.appInstances ) {
						if ( $scope.appInstances[ i ].name == appName )
							$scope.appInstances[ i ].running = true;
					}
				} );
			} );

		}
	} ).error( function() {
		alert('Cannot find module '+appName+'. Have you saved already?');
	});
};


function stopApp( $http, $scope, appName ) {
	$http.delete( '/api/' + apiVersion + '/apps/' + appName + '/instance' ).success( function( data, status, headers, config ) {
		console.log( 'stop status: ' + data );
		for ( i in $scope.appInstances ) {
			if ( $scope.appInstances[ i ].name == appName )
				$scope.appInstances[ i ].running = false;
		}
	} );
}


app.controller( 'AppsController',
	function( $scope, $http ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		console.log( 'AppsController' );


		$.getJSON( '/api/' + apiVersion + '/apps', function( data ) {
			$scope.editType = 'app';
			$scope.appFilesTemplate = 'app/partials/appNames.html';

			$scope.appInstances = data.apps;



			$scope.stopApp = function( appName ) {
				stopApp( $http, $scope, appName );
			};


			$scope.startApp = function( appName ) {
				startApp( $http, $scope, appName );
			};

			$scope.editApp = function( appName ) {

			};



			$scope.$apply();
		} );

	}
);


app.controller( 'AppEditController',
	function( $scope, $http, $routeParams ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$scope.ensureDeleteFile = function( fileName ) {

			if( fileName == 'newApp' )
				return;

			var retVal = confirm( 'Are you sure you want to delete ' + fileName + '?' );
			if ( retVal == true ) {


				$http.delete( '/api/' + apiVersion + '/app/' + fileName ).success( function( data, status, headers, config ) {
					console.log( 'stop status: ' + data );
					alert( data );
				} );
				//alert( "User wants to continue!" );
				//return true;
			}
		};

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

		var appName = $routeParams.appName;
		console.log( appName );
		$.ajax( {
			type: 'GET',
			url: '/api/' + apiVersion + '/app/' + appName,
		} ).done( function( data ) {

			$scope.fileName = appName;
			$scope.code = data;

			initEditor();

			$scope.stopApp = function( appName ) {
				stopApp( $http, $scope, appName );
			};


			$scope.startApp = function( appName ) {
				var appName = $scope.fileName;
				startApp( $http, $scope, appName );
			};

			$scope.$apply();
		} );


	}
);