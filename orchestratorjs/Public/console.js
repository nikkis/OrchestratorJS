require.config( {
    baseUrl: "/js",
    paths: {
        "templates": "/templates"
    },
    waitSeconds: 15
} );



$( function() {
    $( '.launchActionBtn' ).click( function( event ) {
        var actionName = event.target.id;
        $.ajax( {
            type: 'POST',
            url: '/api/' + apiVersion + '/action/' + actionName,
        } ).done( function( msg ) {
            console.log( msg );
        } );
    } );
} );


$( function() {
    /*$( '.topMenuBtn' ).click( function( event ) {
        var toShow = $.param.fragment( event.target.href );
        showView( toShow );
    } );
*/
} );


$( function() {
   /* $( '.aTopMenuBtn' ).click( function( event ) {
        //event.preventDefault();
    } );
*/
} );





function changeActivePage(newPage) {
    $('ul li.active').removeClass('active');
    $('ul li a[href="#'+ newPage +'"]').parent().addClass('active');
}



function showView( name ) {
   

    console.log('name: '+name);
   
/*
    $('.non-angular-container').show();
    $('.angular-container').hide();
    

    switch ( name ) {
        case 'actions':
            showActions();
            break;
        case 'capabilities':
            showCapabilities();
            break;
        case 'instances':
            showInstances();
            break;
        case 'devices':
            showDevices();
            break;
        case 'download':
            showDownloads();
            break;
        case 'develop':
            showDevelop();
            break;
        case 'develop+android':
            showDevelopAndroid();
            break;
        case 'develop+gadgeteer':
            showDevelopGadgeteer();
            break;            
        case 'api':
            showAPI();
            break;         
        default:
            showHome();
            break;
    }
*/
}



/********************************************************************
 *     ACTIONS
 *********************************************************************/

function showActions() {

console.log('showing actions..');

    $.getJSON( '/api/' + apiVersion + '/action', function( data ) {
        require( [ 'text!templates/fileNames.html' ], function( fileNamesTemplate ) {
          var templateData = {
            'filenames': data['actions'],
            'type': 'Action'
          };
          var html = Mustache.to_html( fileNamesTemplate, templateData );
          html = '<div class="row contents"><div class="large-9 columns actionCode"></div>' + html + '</div>';
          $( '.non-angular-container' ).html( html );

          changeActivePage('#actions');
        } );
    } );
}


function updateActionNames() {
    $.getJSON( '/api/' + apiVersion + '/action', function( data ) {
        require( [ 'text!templates/fileNames.html' ], function( fileNamesTemplate ) {

          var html = Mustache.to_html( fileNamesTemplate, {
                "filenames": data['actions'],
                "type": "Action"
            } );
          $( '.fileNames' ).replaceWith( html );

          var actionName = $( '#fileNameInput' ).val();
          $( '.fileName_' + actionName ).addClass( 'active' );

        } );
    } );
}

function showActionCode( actionName ) {

    if ( actionName == '' ) {
        $( '.actionCode' ).replaceWith( '<div class="large-9 columns actionCode">' + '</div>' );
        return
    }

    $.ajax( {
        type: 'GET',
        url: '/api/' + apiVersion + '/action/' + actionName,
    } ).done( function( data ) {

        require( [ 'text!templates/editActionCode.html' ], function( editActionCodeTemplate ) {

          var html = Mustache.to_html( editActionCodeTemplate, {
              "code": data,
              "actionName" : actionName
          } );

          $( '.actionCode' ).replaceWith( html );
          loadFileToEditor( 'action' );
          $( '.fileNameLink' ).removeClass( 'active' );
          $( '.fileName_' + actionName ).addClass( 'active' );

          showParams();
      } );


    } );
}

function showPreviousParams( checkbox, actionName ) {
    if ( checkbox.checked ) {
        $.getJSON( '/api/' + apiVersion + '/action/' + actionName + '/metadata', function( data ) {
            console.log( data );
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
}

function showParams() {

    //var newParamLine = '<input type="text" id="paramLine" style="width:100%;" placeholder="usage: &quot;string&quot; or 1234 or &quot;device:username@devicename&quot; and then hit enter"/>';
    //var newParamLine = '<input type="text" id="paramLine" style="width:100%;" placeholder="usage: string or device:username@devicename and then hit enter"/>';
    //$('.triggerActionForm').append('<div class="row newActionParams"><div class="large-10 columns">'+newParamLine+'</div></div>');

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
        $( '#paramLine' ).select2( 'container' ).find( 'ul.select2-choices' ).sortable( {
            containment: 'parent',
            start: function() {
                $( '#paramLine' ).select2( 'onSortStart' );
            },
            update: function() {
                $( '#paramLine' ).select2( 'onSortEnd' );
            }
        } );
    } );

}

function triggerAction( actionName ) {

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

}


function ensureDeleteAction() {
    require( [ 'text!templates/deleteActionModal.html' ], function( deleteActionModal ) {
        var actionName = $( '#fileNameInput' ).val();
        var data = {
            "actionName": actionName
        };
        var html = Mustache.to_html( deleteActionModal, data );
        $( '.generalModalDiv' ).replaceWith( '<div class="generalModalDiv">' + html + '</div>' );
        $( '#deleteActionModal' ).foundation( 'reveal', 'open' );
    } );
}

function deleteAction( actionName ) {
    $.ajax( {
        type: 'DELETE',
        url: '/api/' + apiVersion + '/action/' + actionName,
    } ).done( function( msg ) {
        $( '#deleteActionModal' ).foundation( 'reveal', 'close' );
        updateActionNames();
        showActionCode( '' );
    } );
}



/********************************************************************
 *     CAPABILITIES
 *********************************************************************/
function showCapabilities() {
    $.getJSON( '/api/' + apiVersion + '/capability', function( data ) {
        require( [ 'text!templates/fileNames.html' ], function( fileNamesTemplate ) {
          var templateData = {
            'filenames': data['capabilities'],
            'type': 'Capability'
          };
          var html = Mustache.to_html( fileNamesTemplate, templateData );
          html = '<div class="row contents"><div class="large-9 columns capabilityCode"></div>' + html + '</div>';
          $( '.non-angular-container' ).html( html );

          changeActivePage('#capabilities');
        } );
    } );
}


function updateCapabilityNames() {
    $.getJSON( '/api/' + apiVersion + '/capability', function( data ) {
      
        require( [ 'text!templates/fileNames.html' ], function( fileNamesTemplate ) {

          var html = Mustache.to_html( fileNamesTemplate, {
                "filenames": data['capabilities'],
                "type": "Capability"
            } );
          $( '.fileNames' ).replaceWith( html );

          var fileName = $( '#fileNameInput' ).val();
          $( '.fileName_' + fileName ).addClass( 'active' );

        } );

/*
        var template = '<ul class="side-nav">{{#capabilities}}<li class="capabilityNameLink capabilityName_{{.}}"><a href="#" onclick="showCapabilityCode(\'{{.}}\');">{{.}}</a></li>{{/capabilities}}</ul>';
        var html = Mustache.to_html( template, data );
        html = '<div class="large-3 columns capabilityNames">' + html + '</div>';
        $( '.capabilityNames' ).replaceWith( html );
        var capabilityName = $( '#fileNameInput' ).val();
        $( '.capabilityName_' + capabilityName ).addClass( 'active' );
*/
    } );
}


function showCapabilityCode( capabilityName ) {
    if ( capabilityName == '' ) {
        $( '.capabilityCode' ).replaceWith( '<div class="large-9 columns capabilityCode">' + '</div>' );
        return;
    }

    $.ajax( {
        type: 'GET',
        url: '/api/' + apiVersion + '/capability/' + capabilityName,
    } ).done( function( data ) {
        require( [ 'text!templates/editCapabilityCode.html' ], function( editCapabilityCodeTemplate ) {
            
            var html = Mustache.to_html( editCapabilityCodeTemplate, {
                "code": data,
                "capabilityName": capabilityName
            } );

            $( '.capabilityCode' ).replaceWith( html );
            loadFileToEditor( 'capability' );
            $( '.fileNameLink' ).removeClass( 'active' );
            $( '.fileName_' + capabilityName ).addClass( 'active' );
        } );
    } );
}

function ensureDeleteCapability() {
    require( [ 'text!templates/deleteCapabilityModal.html' ], function( deleteCapabilityModal ) {
        var capabilityName = $( '#fileNameInput' ).val();
        var data = {
            "capabilityName": capabilityName
        };
        var html = Mustache.to_html( deleteCapabilityModal, data );

        $( '.generalModalDiv' ).replaceWith( '<div class="generalModalDiv">' + html + '</div>' );
        $( '#deleteCapabilityModal' ).foundation( 'reveal', 'open' );
    } );
}

function deleteCapability( capabilityName ) {
    $.ajax( {
        type: 'DELETE',
        url: '/api/' + apiVersion + '/capability/' + capabilityName,
    } ).done( function( msg ) {
        console.log( msg );
        $( '#deleteCapabilityModal' ).foundation( 'reveal', 'close' );
        updateCapabilityNames();
        showCapabilityCode( '' );
    } );
}



/********************************************************************
 *     INSTANCES
 *********************************************************************/


function showInstances() {

    console.log('old showInstances');

    $.getJSON( '/api/' + apiVersion + '/actioninstances', function( data ) {
        require( [ 'text!templates/actioninstances.html' ], function( actioninstancesTemplate ) {
            var html = Mustache.to_html( actioninstancesTemplate, data );
            html = '<div class="row contents"><div class="large-12 columns">' + html + '</div></div>';
            $( '.non-angular-container' ).html( html );
        } );
    } );
}


function deleteActionInstance( actioninstanceID ) {
    console.log( 'deleting: ' + actioninstanceID );

    $.ajax( {
        type: 'DELETE',
        url: '/api/' + apiVersion + '/actioninstance/' + actioninstanceID,
    } ).done( function( msg ) {
        console.log( msg );
        //showInstances();
    } );
}



/********************************************************************
 *     DEVICES
 *********************************************************************/


function showDevices() {
    $.getJSON( '/api/' + apiVersion + '/devices', function( data ) {
        require( [ 'text!templates/devices.html' ], function( devicesTemplate ) {
            var html = Mustache.to_html( devicesTemplate, data );
            html = '<div class="row contents"><div class="large-12 columns">' + html + '</div></div>';
            $( '.non-angular-container' ).html( html );
        } );
    } );
}



/********************************************************************
 *     DOWNLOADS
 *********************************************************************/


function showDownloads() {
    $.getJSON( '/api/' + apiVersion + '/downloads', function( data ) {
        console.log( data );
        require( [ 'text!templates/downloads.html' ], function( downloadsTemplate ) {
            var html = Mustache.to_html( downloadsTemplate, data );
            $( '.non-angular-container' ).html( html );
        } );
    } );
}





/********************************************************************
 *     DEVELOP
 *********************************************************************/


function showDevelop() {
  require( [ 'text!templates/docs/developGeneral.html' ], function( template ) {
      var data = {};
      var html = Mustache.to_html( template, data );
      $( '.non-angular-container' ).html( html );
  } );
}


function showDevelopAndroid() {
  require( [ 'text!templates/docs/developAndroid.html' ], function( template ) {
      var data = {};
      var html = Mustache.to_html( template, data );
      $( '.non-angular-container' ).html( html );
  } );
}


function showDevelopGadgeteer() {
  require( [ 'text!templates/docs/developGadgeteer.html' ], function( template ) {
      var data = {};
      var html = Mustache.to_html( template, data );
      $( '.non-angular-container' ).html( html );
  } );
}



function showAPI() {
  require( [ 'text!templates/docs/developAPI.html' ], function( template ) {
      var data = {};
      var html = Mustache.to_html( template, data );
      $( '.non-angular-container' ).html( html );
  } );
}




function showHome() {}











