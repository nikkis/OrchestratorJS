ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log



var config = require( ROOT + '/config.json' );

var mongoose = require( 'mongoose' );
var db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'Cannot connect to mongodb:' ) );
mongoose.connect( 'mongodb://localhost/' + config.database );


var ojsConsoleSocket = ( config.services.ojsConsole.enabled ) ? require( 'socket.io-client' ).connect( 'http://0.0.0.0:' + config.services.ojsConsole.port ) : undefined;
var ojsDeviceRegistrySocket = ( config.services.ojsDeviceRegistry.enabled ) ? require( 'socket.io-client' ).connect( 'http://0.0.0.0:' + config.services.ojsDeviceRegistry.port ) : undefined;
function emitContextData( contextDataDict ) {
  
  if ( config.services.ojsDeviceRegistry.enabled )
    ojsDeviceRegistrySocket.emit( 'ojs_context_data', contextDataDict );

  if ( config.services.ojsConsole.enabled )
    ojsConsoleSocket.emit( 'ojs_context_data', contextDataDict );
}




var deviceSchema = mongoose.Schema( {
  identity: {
    type: String,
    unique: true
  },
  bluetoothMAC: String,
  name: String,
  type: String,
  capabilities: [],
  metadata: {},
  lastSeen: {
    type: Date,
    default: Date.now
  },

} );


var DeviceModel = mongoose.model( 'DeviceModel', deviceSchema );
module.exports = function DeviceHandler() {


  // !! currently only used to emit message for view !!
  this.deviceOnline = function( identity ) {

    var temp = {
      deviceIdentity: identity,
      key: 'online',
      value: true
    };

    emitContextData( temp );
  };


  // !! currently only used to emit message for view !!
  this.deviceOffline = function( identity ) {
    var temp = {
      deviceIdentity: identity,
      key: 'online',
      value: false
    };

    emitContextData( temp );
  };






  this.findDevice = function( identity, callback ) {
    DeviceModel.findOne( {
      identity: identity
    }, callback );
  };

  this.updateOrCreateDevice = function( identity, bluetoothMAC, name, type, capabilities ) {

    var lastSeen = new Date();
    var query = {
      identity: identity
    };

    DeviceModel.findOneAndUpdate( query, {
      $set: {
        bluetoothMAC: bluetoothMAC,
        name: name,
        type: type,
        capabilities: capabilities,
        lastSeen: lastSeen
      }
    }, {
      upsert: true
    }, function( err, dev ) {
      if ( !err ) {
        console.log( dev.identity );
      } else {
        console.log( 'error while userting DeviceModel: ' + err );
      }

    } );

  };


  this.upsertMetadata = function( identity, newMetadata, next ) {

    var publishThese = {};

    DeviceModel.findOne( {
      identity: identity
    }, function( err, dev ) {
      if ( err )
        console.log( 'error while userting metadata for ' + identity + ':' + err );

      var deviceMetadata = dev.metadata;
      if ( !deviceMetadata )
        deviceMetadata = {};

      for ( newKey in newMetadata ) {

        // publish only when metadata changes
        if ( !deviceMetadata[ newKey ] || deviceMetadata[ newKey ] != newMetadata[ newKey ] ) {
          var key = newKey; //newKey + '+' + identity;
          publishThese[ key ] = {
            deviceIdentity: identity,
            key: newKey,
            value: newMetadata[ newKey ]
          };
        }
// check the null issue!!
        deviceMetadata[ newKey ] = newMetadata[ newKey ];
      }

      DeviceModel.findOneAndUpdate( {
        identity: identity
      }, {
        $set: {
          metadata: deviceMetadata,
        }
      }, {
        upsert: true
      }, function( err, dev ) {
        if ( err )
          console.log( 'error while userting metadata for ' + identity + ':' + err );

        // sending pubsub notifications
        for ( key in publishThese ) {
          emitContextData( publishThese[ key ] );
        }
        


        next();
      } );

    } );

  };


  //db.devicemodels.remove({identity: "device:nikkis@s3mini"})

  this.findMultipleDevices = function( identities, callback ) {
    DeviceModel.find( {
      identity: {
        $in: identities
      }
    }, callback );
  };

  this.findAllDevices = function( callback ) {
    DeviceModel.find( callback );
  };
}