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



// identity = username + '@' + name
var deviceSchema = mongoose.Schema( {
  identity: {
    type: String,
    unique: true
  },
  username: String,
  bluetoothMAC: String,
  btUUID: String,
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



  this.removeDevice = function( identity, callback ) {
    DeviceModel.remove( {
      identity: identity
    }, callback );
  };


  this.findDevice = function( identity, callback ) {
    DeviceModel.findOne( {
      identity: identity
    }, callback );
  };


  // new ( for user controller )

  this.findUserDevices = function( username, next ) {
    DeviceModel.find( {
      username: username
    }, next );
  };


  this.upsertDevice = function( identity, username, bluetoothMAC, type, deviceName, capabilities, next ) {

    var lastSeen = new Date();

    var query = {
      identity: identity,
      username: username
    };

    DeviceModel.findOneAndUpdate( query, {
        $set: {
          identity: identity,
          username: username,
          bluetoothMAC: bluetoothMAC,
          type: type,
          name: deviceName,
          capabilities: capabilities,
          lastSeen: lastSeen
        }
      }, {
        upsert: true
      },
      next );
  };



  this.removeCapability = function( capabilityName ) {

    var lastSeen = new Date();
    DeviceModel.find( function( err, devicemodels ) {
      for ( i in devicemodels ) {

        if ( devicemodels[ i ].capabilities && devicemodels[ i ].capabilities.indexOf( capabilityName ) != -1 ) {
          log( 'removing ' + capabilityName + ' from ' + devicemodels[ i ].identity );
          devicemodels[ i ].capabilities.splice( devicemodels[ i ].capabilities.indexOf( capabilityName ) );
          devicemodels[ i ].save();
        }
      }

    } );

  };



  this.updateOrCreateDevice = function( identity, bluetoothMAC, username, type, capabilities ) {

    var lastSeen = new Date();
    var query = {
      identity: identity
    };

    DeviceModel.findOneAndUpdate( query, {
      $set: {
        bluetoothMAC: bluetoothMAC,
        username: username,
        type: type,
        capabilities: capabilities,
        lastSeen: lastSeen
      }
    }, {
      upsert: true
    }, function( err, dev ) {

      log('jepulis');

      if ( !err ) {

        if( !dev.btUUID ) {
          log('not yet UUID -> generate + save');
          dev.btUUID = HELPERS.getUUID();
          dev.save();
          log('saved UUID');

        }

        console.log( dev.identity );
      } else {
        console.log( 'error while userting DeviceModel: ' + err );
      }

    } );

  };


  this.upsertMetadata = function( identity, newMetadata, next1 ) {

    log( 'upsert begin' );

    var publishThese = {};



    var theUpserMethod = function( identity, newMetadata, cb ) {

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
              value: newMetadata[ newKey ],
              oldValue: deviceMetadata[ newKey ]
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

            /*
            // check for special keys, like bt_devices
            if( key == 'bt_devices' ) {
              bt_devices_handler( identity, publishThese[ key ].value );

            // the default case
            } else {
              emitContextData( publishThese[ key ] );
            }
*/



            // original:
            emitContextData( publishThese[ key ] );

          }


          cb();
        } );

      } );
    }



    // check for special keys, like bt_devices. ( Could also filter these from device updates )
    for ( key in newMetadata ) {
      if ( key == 'bt_devices' ) {
        bt_devices_handler( identity, newMetadata[ key ] );
      }
    }


    theUpserMethod( identity, newMetadata, next1 );



    // context data special handlers
    function bt_devices_handler( identity, btDevicesTuple ) {

      log( btDevicesTuple );

      function getSSID( btMac ) {
        for ( index in btDevicesTuple ) {
          if ( btDevicesTuple[ index ][ 0 ] == btMac )
            return btDevicesTuple[ index ][ 1 ];
        }
      }

      var deviceBluetoothMacs = [];
      for ( index in btDevicesTuple ) {
        log( btDevicesTuple[ index ] );
        deviceBluetoothMacs.push( btDevicesTuple[ index ][ 0 ] );
      }
      log( 'foo ----- 0' );
      log( deviceBluetoothMacs );
      log( 'foo ----- 1' );

      DeviceModel.find( {
        bluetoothMAC: {
          $in: deviceBluetoothMacs
        }
      }, function( err, deviceModels ) {
        if ( err ) {
          log( 'error while handling context data for bt_devices: ' + err );
          return;
        }

        var nearbyRegisteredDevices = [];
        for ( i in deviceModels ) {
          var ssid = getSSID( deviceModels[ i ].bluetoothMAC );
          var distance = HELPERS.ssidToM( ssid );

          log( 'nearby registered device: ' + deviceModels[ i ].identity + ': ' + ssid + ', m: ' + distance );
          nearbyRegisteredDevices.push( [ deviceModels[ i ].identity, distance ] );
        }



        DeviceModel.findOne( {
          identity: identity
        }, function( err, dev ) {
          if ( err || !dev )
            return;

          var deviceMetadata = dev.metadata;
          if ( !deviceMetadata )
            deviceMetadata = {};

          deviceMetadata[ 'proximityDevices' ] = nearbyRegisteredDevices;

          // update device that reported to proximity set
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
              // original:
              emitContextData( {
                deviceIdentity: identity,
                key: "proximityDevices",
                value: nearbyRegisteredDevices,
                oldValue: []
              } );
            }

          } ); // find and update the metadata

        } ); // find to get metadata


      } ); // bt

    } // bt_device_handler()


  };



  this.findDevicesBasedOnBluetooth = function( btMacs, callback ) {
    DeviceModel.find( {
      bluetoothMAC: {
        $in: btMacs
      }
    }, callback );
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
