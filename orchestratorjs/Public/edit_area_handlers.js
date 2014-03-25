authUsername = '';
authToken = '';
// for angular version
function initAuthTokens( username, token ) {
  authUsername = username;
  authToken = token;
}

// for angular version
function initEditor() {
  editAreaLoader.init( {
    id: "code_area",
    start_highlight: true,
    allow_resize: "y",
    allow_toggle: false,
    language: "en",
    syntax: "js",
    is_editable: false,
    toolbar: "new_document, save, |, search, |, undo, redo, |, select_font, |, highlight, reset_highlight",
    load_callback: "loadAppFile",
    save_callback: "saveAppFile"
  } );
}



// callback function for angular version
function saveAppFile( id, content ) {
  saveWithMode( 'app', content );
}



// callback function for angular version
function saveWithMode( fileType, content ) {

  var text = content;

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

  if ( !authUsername ) {
    alert( 'You must sign in first!\nNot saved!' );
    return;
  }

  console.log( 'auth username' + authUsername );

  $.ajax( {
    url: '/api/1/user/' + authUsername + '/' + fileType + '/' + fileName,
    data: text,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',

  } ).fail( function( resp ) {
    alert( resp.responseText );
  } ).done( function( resp ) {

    // save also app description
    var appDesc = $( '#appDescriptionInput' ).val();

    var pp = {};
    pp[ 'appDesc' ] = appDesc;

    $.ajax( {
        type: 'POST',
        url: '/api/1/user/' + authUsername + '/' + fileType + '/' + fileName + '/info',
        contentType: 'application/json',
        data: JSON.stringify( pp ),
    } ).done( function( msg ) {
    } );

    return;
  } );
}

// old version begins here



var currentMode = '';

function loadFileToEditor( mode ) {
  currentMode = mode;
  editAreaLoader.init( {
    id: "example_1" // id of the textarea to transform  
    ,
    start_highlight: true,
    allow_resize: "y",
    allow_toggle: false,
    language: "en",
    syntax: "js",
    is_editable: false,
    toolbar: "new_document, save, |, search, go_to_line, |, undo, redo, |, select_font, |, highlight, reset_highlight",
    load_callback: "my_load",
    save_callback: "my_save"

  } );
}



function editableCode() {

  editAreaLoader.execCommand( 'example_1', 'set_editable', !editAreaLoader.execCommand( 'example_1', 'is_editable' ) );
  if ( editAreaLoader.execCommand( 'example_1', 'is_editable' ) ) {
    //$('.editStopEditLink').replaceWith('<a id="editStopEditLink" href="#" onclick="editableCode();" ><i class="foundicon-edit"></i></a>');
    $( '.myEditIcon' ).removeClass( 'fi-page-edit' );
    $( '.myEditIcon' ).addClass( 'fi-lock' );

    $( '.fileNameEdit' ).show();
    $( '.myRemoveIcon' ).show();

  } else {
    //$('.editStopEditLink').replaceWith('<a id="editStopEditLink" href="#" onclick="editableCode();" ><i class="foundicon-lock"></i></a>');
    $( '.myEditIcon' ).removeClass( 'fi-lock' );
    $( '.myEditIcon' ).addClass( 'fi-page-edit' );
    $( '.fileNameEdit' ).hide();
    $( '.myRemoveIcon' ).hide();

  }
}



// callback functions
function my_save( id, content ) {

  var text = content;

  var fileName = $( '#fileNameInput' ).val();
  if ( fileName == '' ) {
    alert( 'File name cannot be empty!' );
    return;
  } else if ( fileName.slice( -3 ) == '.js' ) {
    alert( 'File name cannot contain .js' );
    return;
  }

  $.ajax( {
    url: '/api/1/' + currentMode + '/' + fileName,
    data: text,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',

  } ).fail( function( resp ) {
    console.log( resp );
    alert( resp.responseText );
  } ).done( function( resp ) {

    if ( currentMode == 'action' ) {
      updateActionNames();
    } else if ( currentMode == 'capability' ) {
      updateCapabilityNames();
    } else {
      return;
    }
  } );
}

function my_load( id ) {
  editAreaLoader.setValue( id, "The content is loaded from the load_callback function into EditArea" );
}

function test_setSelectionRange( id ) {
  editAreaLoader.setSelectionRange( id, 100, 150 );
}

function test_getSelectionRange( id ) {
  var sel = editAreaLoader.getSelectionRange( id );
  alert( "start: " + sel[ "start" ] + "\nend: " + sel[ "end" ] );
}

function test_setSelectedText( id ) {
  text = "[REPLACED SELECTION]";
  editAreaLoader.setSelectedText( id, text );
}

function test_getSelectedText( id ) {
  alert( editAreaLoader.getSelectedText( id ) );
}

function editAreaLoaded( id ) {
  if ( id == "example_2" ) {
    //  open_file1();
    //  open_file2();
  }
}

function open_file1() {
  var new_file = {
    id: "to\\ é # € to",
    text: "$authors= array();\n$news= array();",
    syntax: 'php',
    title: 'beautiful title'
  };
  editAreaLoader.openFile( 'example_2', new_file );
}

function open_file2() {
  var new_file = {
    id: "Filename",
    text: "<a href=\"toto\">\n\tbouh\n</a>\n<!-- it's a comment -->",
    syntax: 'html'
  };
  editAreaLoader.openFile( 'example_2', new_file );
}

function close_file1() {
  editAreaLoader.closeFile( 'example_2', "to\\ é # € to" );
}

function toogle_editable( id ) {
  editAreaLoader.execCommand( id, 'set_editable', !editAreaLoader.execCommand( id, 'is_editable' ) );
}