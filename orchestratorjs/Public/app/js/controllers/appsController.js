var app = angular.module( 'ojsConsole.controllers.AppsController', [ 'ojsConsole.services' ] );



function startApp( $http, $scope, appName, UserService ) {

	var username = UserService.username;

	if ( !UserService.isLogged ) {
		alert( 'You need to sign in first!\n' );
		return;
	}
	
	if ( !appName ) {
		alert( 'You need to save your app first!\n' );
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
	
	if ( !UserService.isLogged ) {
		alert( 'You need to sign in first!\n' );
		return;
	}

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


		var orig = CodeMirror.hint.javascript;
		CodeMirror.hint.javascript = function(cm) {
		  var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
		  inner.list = [];
		  //inner.list.push("talkingCapabilityt.say( line, voice, pitch );");
		  return inner;
		};

		$scope.UserService = UserService;

		$scope.ensureDeleteApp = function() {
			var fileName = $( '#fileNameInput' ).val();
			if ( !fileName )
				return;

			var retVal = confirm( 'Are you sure you want to delete ' + fileName + '?' );
			if ( retVal == true ) {


				$http.delete( '/api/' + apiVersion + '/user/' + UserService.username + '/app/' + fileName ).success( function( data, status, headers, config ) {
					console.log( 'stop status: ' + data );
					alert( data );
				} );
			}
		};

		$scope.pushToCloud = function() {


		  var text = editor.getValue();

		  var fileName = $( '#fileNameInput' ).val();
		  if ( fileName == '' ) {
		    alert( 'File name cannot be empty!' );
		    return;

		  } else if ( fileName.slice( -3 ) == '.js' ) {
		    alert( 'File name cannot contain .js' );
		    return;
		  }

		  if ( !$scope.UserService.isLogged ) {
		    alert( 'You must sign in first!\nNot saved!' );
		    return;
		  }

		  $.ajax( {
		    url: '/api/1/user/' + $scope.UserService.username + '/app/' + fileName,
		    data: text,
		    cache: false,
		    contentType: false,
		    processData: false,
		    type: 'POST',

		  } ).fail( function( resp ) {
		    alert( resp.responseText );
		  } ).done( function( resp ) {
		  	alert( fileName+ ' saved!' );
				  	
				// save also app description
		    var appDesc = $( '#appDescriptionInput' ).val();

		    var pp = {};
		    pp[ 'appDesc' ] = appDesc;

		    $.ajax( {
		        type: 'POST',
		        url: '/api/1/user/' + authUsername + '/app/' + fileName + '/info',
		        contentType: 'application/json',
		        data: JSON.stringify( pp ),
		    } ).done( function( msg ) {
		    } );

		  } );

		};


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
				if( appName != 'newApp' )
					$scope.fileName = appName;
				
				editor.setValue(data);


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