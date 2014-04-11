var app = angular.module( 'ojsConsole.controllers.ActionAndCapabilityControllers', [ 'ojsConsole.services' ] );



function loadFilesList( $scope ) {
	$.getJSON( '/api/' + apiVersion + '/' + $scope.type, function( data ) {
		$scope.filenames = data[ 'files' ];
		$scope.$apply();
	} );
}

function loadCodeToEditor( fileName, $scope ) {
  $.ajax( {
      type: 'GET',
      url: '/api/' + apiVersion + '/' + $scope.type + '/' + fileName,
  } ).done( function( data ) {
		
		$scope.fileName = fileName;
		$scope.$apply();

		editor.setValue(data);
		
  } );
}

function newFile( $scope ) {
  $scope.fileName = '';
  editor.setValue('');
}

function deleteFile( $scope, $http ) {
	
	var fileName = $( '#fileNameInput' ).val();
	if( !fileName ) {
		alert( 'Nothing to delete!' );
		return;
	}

	if ( !$scope.UserService.isLogged ) {
    alert( 'You must sign in first!\nNot saved!' );
    return;
  }

	var retVal = confirm( 'Are you sure you want to delete ' + fileName + '?' );
	if ( retVal == true ) {
		$http.delete( '/api/' + apiVersion + '/user/' + $scope.UserService.username + '/' + $scope.type + '/' + fileName ).success( function( data, status, headers, config ) {
			alert( data );
			newFile( $scope );
			loadFilesList( $scope );
		} );	
	}
}


function pushCodeToCloud( $scope ) {


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
    url: '/api/1/user/' + $scope.UserService.username + '/' + $scope.type + '/' + fileName,
    data: text,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',

  } ).fail( function( resp ) {
    alert( resp.responseText );
  } ).done( function( resp ) {
  	alert( fileName+ ' saved!' );
  	loadFilesList( $scope );
  } );
	
}


/*
*			Action
*/


app.controller( 'ActionInstancesController',
	function( $scope, $http, AuthService, UserService ) {


		$scope.UserService = UserService;

		

		$http.get( '/api/' + apiVersion + '/actioninstances' ).success( function( data, status, headers, config ) {
			$scope.actioninstances = data.actioninstances;
		} );	


		$scope.deleteActionInstance = function( actioninstanceID ) {
			$http.delete( '/api/' + apiVersion + '/actioninstance/' + actioninstanceID ).success( function( data, status, headers, config ) {
				alert( data );

			} ).error( function( data, status, headers, config ) {
				alert( data );
			} );

			$http.get( '/api/' + apiVersion + '/actioninstances' ).success( function( data, status, headers, config ) {
				$scope.actioninstances = data.actioninstances;
			} );

		};

	}
);




app.controller( 'ActionEditController',
	function( $scope, $http, AuthService, UserService ) {

    $.getJSON( '/api/' + apiVersion + '/capabilities/info', function( data ) {

    	var completionList = [];
    	for( capabilityName in data ) {
    		completionList = completionList.concat( data[ capabilityName ].codeCompletionLines );
    	}
			// load capability methods completion
			var orig = CodeMirror.hint.javascript;
			CodeMirror.hint.javascript = function(cm) {
			  var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
			  inner.list = completionList;

				// TODO: improve this feature
				//console.log( 'CodeMirror' );
				//console.log( cm.getCursor() );

			  return inner;
			};

    } );




		$scope.UserService = UserService;
		$scope.type = 'Action';
		$scope.prevParamCheckbox = false;
		
		loadFilesList( $scope );

		$scope.showActionCode = function( fileName ) {
			loadCodeToEditor( fileName, $scope );
			loadDeviceParameters();

			$scope.prevParamCheckbox = false;
			$( "input#paramLine" ).select2( 'data', [] );
		};

		$scope.pushToCloud = function() {
			pushCodeToCloud( $scope );
		};

    $scope.newFile = function() {
      newFile( $scope );
    };

    $scope.ensureDeleteAction = function() {
    	deleteFile( $scope, $http );
    };



    // action specific handlers
		$scope.showPreviousParams = function() {
			var fileName = $( '#fileNameInput' ).val();
    	if ( $scope.prevParamCheckbox) { 		
        $.getJSON( '/api/' + apiVersion + '/action/' + fileName + '/metadata', function( data ) {
          var preLoadData = [];
          for ( i in data.args ) {
            var temp = data.args[ i ];
            preLoadData.push( {
              id: "p" + i,
              text: JSON.stringify( temp )
            } );
          }
          $( "input#paramLine" ).select2( 'data', preLoadData );
        } );
      }
    };

    $scope.triggerAction = function() {
			var actionName = $( '#fileNameInput' ).val();
			if( !actionName ) {
				alert('No action selected!');
				return;
			}
	    var actionParameters = [];
	    var divs = $( "#paramLine" ).select2( "container" ).children().find( '.select2-search-choice' ).find( 'div' );
	    for ( var i = 0; i < divs.length; i++ ) {
        var div = divs[ i ];
        var param = $( div ).text();
        var object = JSON.parse( param );
        actionParameters.push( object );
	    };

	    var pp = {};
	    pp[ 'actionName' ] = actionName;
	    pp[ 'parameters' ] = actionParameters;

	    $.ajax( {
	       type: 'POST',
	       url: '/api/' + apiVersion + '/actioninstance',
	       contentType: 'application/json',
	       data: JSON.stringify( pp ),
	    } ).done( function( msg ) {
	       alert( msg );
	       console.log( msg );
	    } );
    };
		

	}
);




function loadDeviceParameters() {
	$.getJSON( '/api/' + apiVersion + '/devices', function( data ) {

    var devices = [];
    var devicesResp = data.devices;
    for ( i in devicesResp ) {
        var devId = devicesResp[ i ].identity;
        devices.push( '\"device:' + devId + '\"' );
    }

    $( "#paramLine" ).select2( {
        tags: devices,
        separator: "<myseparotor>",
        tokenSeparators: [ "<myseparotor>" ]
    } );

    $( '#paramLine' ).on( 'change', function() {
        $( '#paramLine_val' ).html( $( '#paramLine' ).val() );
    } );

/*    $( '#paramLine' ).select2( 'container' ).find( 'ul.select2-choices' ).sortable( {
        containment: 'parent',
        start: function() {
            $( '#paramLine' ).select2( 'onSortStart' );
        },
        update: function() {
            $( '#paramLine' ).select2( 'onSortEnd' );
        }
    } );
*/
	});
}








/*
*			Capability
*/
app.controller( 'CapabilityEditController',
	function( $scope, $http, AuthService, UserService ) {



		var orig = CodeMirror.hint.javascript;
		CodeMirror.hint.javascript = function(cm) {
		  var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
		  inner.list = [];
		  inner.list.push("module.exports = {\n\n};");
		  inner.list.push("methodName: function ( param1, param2 ) {},");
		  return inner;
		};


		$scope.UserService = UserService;
		$scope.type = 'Capability';
		
		loadFilesList( $scope );

		$scope.showCapabilityCode = function( fileName ) {
			loadCodeToEditor( fileName, $scope );
		};

		$scope.pushToCloud = function() {
			pushCodeToCloud( $scope );
		};

    $scope.newFile = function() {
      newFile( $scope );
    };

    $scope.ensureDeleteCapability = function() {
    	deleteFile( $scope, $http );
    };

	}
);


