var app = angular.module( 'ojsConsole.controllers.AppsController', [ 'ojsConsole.services' ] );



function startApp( $http, $scope, appName, UserService ) {

	var username = UserService.username;

	//var appName = $scope.fileName;
	if ( appName == 'newApp' ) {
		alert( 'You need to save your app first!\n( name newApp is reserved )' );
		return;
	}

	// get list of required settings and possible previously saved settings
	$http.get( '/api/' + apiVersion + '/user/' + username + '/app/' + appName + '/settings' ).success( function( data, status, headers, config ) {

		var settings = {};
		if ( data && data && data.settings && data.settings.length != 0 ) {
			for ( key in data.settings ) {
				var oldValue = data.settings[ key ];
				var temp = prompt( "Please parameter " + key, oldValue );
				if ( !temp ) {
					alert( 'All settings need to be given!' );
					return;
				} else {
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
		alert( 'Cannot find module ' + appName + '. Have you saved already?' );
	} );
};


function stopApp( $http, $scope, appName, UserService ) {
	$http.delete( '/api/' + apiVersion + '/user/' + UserService.username + '/app/' + appName + '/instance' ).success( function( data, status, headers, config ) {
		for ( i in $scope.appInstances ) {
			if ( $scope.appInstances[ i ].name == appName )
				$scope.appInstances[ i ].running = false;
		}
	} );
}


app.controller( 'AppsController',
	function( $scope, $http, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$scope.UserService = UserService;

		$.getJSON( '/api/' + apiVersion + '/apps', function( data ) {
			$scope.editType = 'app';
			$scope.appFilesTemplate = 'app/partials/appNames.html';

			$scope.appInstances = data.apps;



			$scope.stopApp = function( appName ) {
				stopApp( $http, $scope, appName, UserService );
			};


			$scope.startApp = function( appName ) {
				startApp( $http, $scope, appName, UserService );
			};

			$scope.$apply();
		} );

	}
);


app.controller( 'AppEditController',
	function( $scope, $http, $routeParams, UserService ) {

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();

		$scope.UserService = UserService;

		$scope.ensureDeleteFile = function( fileName ) {

			if ( fileName == 'newApp' )
				return;

			var retVal = confirm( 'Are you sure you want to delete ' + fileName + '?' );
			if ( retVal == true ) {


				$http.delete( '/api/' + apiVersion + '/user/' + UserService.username + '/app/' + fileName ).success( function( data, status, headers, config ) {
					console.log( 'stop status: ' + data );
					alert( data );
				} );
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

		token = 'diipaa';
		initAuthTokens( UserService.username, token );

		var appName = $routeParams.appName;
		console.log( appName );
		console.log( UserService.username );
		$.ajax( {
			type: 'GET',
			url: '/api/' + apiVersion + '/user/' + UserService.username + '/app/' + appName,
		} ).done( function( data ) {


			$.ajax( {
				type: 'GET',
				url: '/api/' + apiVersion + '/user/' + UserService.username + '/app/' + appName + '/info',
			} ).done( function( appInfoData ) {

				$scope.appDesc  = appInfoData.desc;
				$scope.fileName = appName;
				$scope.code = data;

				initEditor();

				$scope.stopApp = function( appName ) {
					stopApp( $http, $scope, appName, UserService );
				};


				$scope.startApp = function( appName ) {
					var appName = $scope.fileName;
					startApp( $http, $scope, appName, UserService );
				};

				$scope.$apply();
			} );
		} );


	}
);