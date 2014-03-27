var app = angular.module( 'ojsConsole.controllers.CapabilityControllers', [ 'ojsConsole.services' ] );


function loadCodeToEditor( capabilityName, $scope ) {
  $.ajax( {
      type: 'GET',
      url: '/api/' + apiVersion + '/capability/' + capabilityName,
  } ).done( function( data ) {
		
		$scope.capabilityName = capabilityName;
		$scope.$apply();

		editor.setValue(data);
		
  } );
}

function newFile( $scope ) {
  $scope.capabilityName = '';
  editor.setValue('');
}


function pushCodeToCloud( $scope, capabilityName, fileType ) {


  var text = editor.getValue();
  console.log( text );

  var fileName = $( '#fileNameInput' ).val();
  if ( fileName == '' ) {
    alert( 'File name cannot be empty!' );
    return;
  } else if ( fileName == 'newApp' ) {
    alert( 'newApp is reserved app name.\nPlease use another one.' );
    return;

  } else if ( fileName.slice( -3 ) == '.js' ) {
    alert( 'File name cannot contain .js' );
    return;
  }

  if ( !$scope.UserService.isLogged ) {
    alert( 'You must sign in first!\nNot saved!' );
    return;
  }

  console.log( 'auth username' + $scope.UserService.username );
  console.log( fileName );


  $.ajax( {
    url: '/api/1/user/' + $scope.UserService.username + '/' + fileType + '/' + fileName,
    data: text,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',

  } ).fail( function( resp ) {
    alert( resp.responseText );
  } ).done( function( resp ) {
  	alert('saved!');
  } );
	
}


app.controller( 'CapabilityEditController',
	function( $scope, AuthService, UserService ) {

		$scope.UserService = UserService;

		$.getJSON( '/api/' + apiVersion + '/capability', function( data ) {

			var templateData = {
				'filenames': data[ 'capabilities' ],
				'type': 'Capability'
			};

			$scope.type = 'Capability';
			$scope.filenames = data[ 'capabilities' ];

			$scope.$apply();

		} );

		$scope.showCapabilityCode = function( capabilityName ) {
			loadCodeToEditor( capabilityName, $scope );
		};

		$scope.pushToCloud = function( capabilityName ) {
			console.log('pushing to cloud: ' + capabilityName);
			pushCodeToCloud( $scope, capabilityName, 'capability' );
		}

    $scope.newFile = function() {
      newFile( $scope );
    }

	}
);

