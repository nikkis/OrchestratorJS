ROOT = process.cwd();
var logger = require( ROOT + '/logs/log' );

var crypto = require( 'crypto' );
var uuid = require('node-uuid');

var fs = require( 'fs' );

this.log = function( m ) {
  //console.log(m);
  logger.info( m );
}


/*
this.rssiToM = function (rssi) {

  // The txPower value should be more negative than the -37 you measured right next to the beacon.  
  // A value around -50 is closer to what you should have.
  var txPower = -40.0;
  if (rssi == 0) {
    return -1.0; // if we cannot determine accuracy, return -1.
  }

  var ratio = rssi * 1.0 / txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio, 10);
  } else {
    var accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    return accuracy;
  }
}
*/

// -1, IMMEDIATE, NEAR, FAR
this.rssiToM = function( rssi ) {
  
  if( !rssi )
    return -1;
  
  if( typeof( rssi ) == 'string' )
    rssi = parseInt( rssi );
    
  // if bigger than    
  if( rssi > -40 )
    // IMMEDIATE
    return 0.1;
  
  else if( rssi > -50 )
    // NEAR
    return 1.0;
  
  else if( rssi > -80 )
    // FAR
    return 10.0;

  else
    
    // NOT IN RANGE
    return -1;
    
    /*
  if( rssi > -70 )
    return 0.1;
  else if( rssi > -89 )
    return 1.0;
  else
    return 10;
    */
};


function printHost() {
  var os = require( 'os' );
  var ifaces = os.networkInterfaces();
  for ( var dev in ifaces ) {
    var alias = 0;
    ifaces[ dev ].forEach( function( details ) {
      if ( details.family == 'IPv4' ) {
        if ( dev.slice( 0, 2 ) == 'en' ) {
          this.log( 'HOSTNAME: ' + details.address );
          this.log( 'PORT:     ' + config.server.port );
        }
        ++alias;
      }
    } );
  }
}

this.getUUID = function() {
  return uuid.v4();
}

this.md5 = function( s ) {
  return crypto.createHash('md5').update( s ).digest('hex');
}


this.getUniqueId = function() {
  return 'id' + ( new Date() ).getTime();
}



this.hexColor = function( str ) {
  function intToARGB( i ) {
    return ( ( i >> 24 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 16 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 8 ) & 0xFF ).toString( 16 ) +
      ( i & 0xFF ).toString( 16 );
  }

  var hash = 0;
  for ( var i = 0; i < str.length; i++ ) {
    hash = str.charCodeAt( i ) + ( ( hash << 5 ) - hash );
  }
  var r = intToARGB( hash ).slice( 2 );

  while ( r.length < 6 )
    r = r + '0';
  return r;
}


this.hashCode = function( str ) {
  function intToARGB( i ) {
    return ( ( i >> 24 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 16 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 8 ) & 0xFF ).toString( 16 ) +
      ( i & 0xFF ).toString( 16 );
  }

  var hash = 0;
  for ( var i = 0; i < str.length; i++ ) {
    hash = str.charCodeAt( i ) + ( ( hash << 5 ) - hash );
  }
  return intToARGB( hash ).slice( 2 );
}


this.deleteFile = function( filepath ) {
  fs.exists( filepath, function( exists ) {
    if ( exists ) {
      fs.unlinkSync( filepath );
    }
  } );
};

this.deleteFolderRecursive = function( path ) {
  var files = [];
  if ( fs.existsSync( path ) ) {
    files = fs.readdirSync( path );
    files.forEach( function( file, index ) {
      var curPath = path + "/" + file;
      if ( fs.statSync( curPath ).isDirectory() ) { // recurse
        deleteFolderRecursive( curPath );
      } else { // delete file
        fs.unlinkSync( curPath );
      }
    } );
    fs.rmdirSync( path );
  }
};


this.saveFileNoRequire = function( filepath, data, callback, callbackParam ) {
  fs.writeFile( filepath, data, function( err ) {
    if ( err ) {
      console.log( err );
    } else {
      console.log( "The file was saved!" );
    }

    // callback was given
    if ( callback && callbackParam ) {
      callback( callbackParam );
    } else if ( callback ) {
      callback( callbackParam );
    }
  } );
}


//this.saveFile = function(filepath, data) {
this.saveFile = function( filepath, data, callback, callbackParam ) {
  fs.writeFile( filepath, data, function( err ) {
    if ( err ) {
      console.log( err );
    } else {
      console.log( "The file was saved!" );
    }

    if ( require.cache[ require.resolve( filepath ) ] ) {
      delete require.cache[ require.resolve( filepath ) ];
    }
    require( filepath );

    // callback was given
    if ( callback && callbackParam ) {
      callback( callbackParam );
    } else if ( callback ) {
      callback( callbackParam );
    }
  } );
}


this.parseArgsFromString = function( str ) {
  var args = /\(([^)]+)/.exec( str );

  if ( args && args.length > 0 && args[ 1 ] ) {
    args = args[ 1 ].split( /\s*,\s*/ );
  } else {
    args = [];
  }
  return args;
};


this.reRequire = function( fullPath ) {
  if ( require.cache[ require.resolve( fullPath ) ] ) {
    delete require.cache[ require.resolve( fullPath ) ];
  }
  return require( fullPath );
};


/*
this.getResourceMD5 = function( type, name ) {

  var resourcepathpart;
  if( type == 'action' || type == 'ACTION' ) {
    resourcepathpart = 'actions';
  } else if ( type = 'capability' || type == 'CAPABILITY' ) {
    resourcepathpart = 'capabilities';
  } else {
    throw( 'unkown resource type for md5' );
  }

  fs.readFile( ROOT + '/resources/' + resourcepathpart + '/' + name + '.js', 'binary', function( error, file ) {

    if( error ) {
      throw( 'Cannot calucalte resource hash' );
    }

    var s = file;

    // does not work, needs invoking a function instead of return.. return crypto.createHash('md5').update( s ).digest('hex');

  } );
}
*/



this.getIdentities = function( params ) {



  function recursiveGetIdentities( params ) {

    for ( i in params ) {
      var param = params[ i ];
      log( 'param: ' + param );
      if ( param instanceof Array ) {
        recursiveGetIdentities( param );
      } else {
        log('else');
        if ( param.slice( 0, 7 ) == 'device:' ) {
          log( param.slice( 7 ) );
          deviceIdentities.push( param.slice( 7 ) );
        }
      }
    }
  }

  var deviceIdentities = [];
  recursiveGetIdentities( params );

  return deviceIdentities;
};
