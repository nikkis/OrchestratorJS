ROOT = process.cwd()
HELPERS = require(ROOT + '/helpers/general.js');
log = HELPERS.log



var config = require(ROOT + '/config.json');

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/' + config.database);


var ojsConsoleSocket = (config.services.ojsConsole.enabled) ? require('socket.io-client').connect('http://0.0.0.0:' + config.services.ojsConsole.port) : undefined;
var ojsDeviceRegistrySocket = (config.services.ojsDeviceRegistry.enabled) ? require('socket.io-client').connect('http://0.0.0.0:' + config.services.ojsDeviceRegistry.port) : undefined;

function emitContextData(contextDataDict) {

  // Publish for OJS apps
  if (config.services.ojsDeviceRegistry.enabled)
    ojsDeviceRegistrySocket.emit('ojs_context_data', contextDataDict);

  // Publish for web-ui
  if (config.services.ojsConsole.enabled)
    ojsConsoleSocket.emit('ojs_context_data', contextDataDict);

}



// identity = username + '@' + name
var deviceSchema = mongoose.Schema({
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

});


var DeviceModel = mongoose.model('DeviceModel', deviceSchema);

module.exports = function DeviceHandler() {


  // !! currently only used to emit message for view !!
  this.deviceOnline = function (identity) {

    var temp = {
      deviceIdentity: identity,
      key: 'online',
      value: true
    };

    emitContextData(temp);
  };


  // !! currently only used to emit message for view !!
  this.deviceOffline = function (identity) {
    var temp = {
      deviceIdentity: identity,
      key: 'online',
      value: false
    };

    emitContextData(temp);
  };



  this.removeDevice = function (identity, callback) {
    DeviceModel.remove({
      identity: identity
    }, callback);
  };


  this.findDevice = function (identity, callback) {
    DeviceModel.findOne({
      identity: identity
    }, callback);
  };


  // new ( for user controller )

  this.findUserDevices = function (username, next) {
    DeviceModel.find({
      username: username
    }, next);
  };


  this.upsertDevice = function (identity, username, bluetoothMAC, btUUID, type, deviceName, capabilities, next) {

    var lastSeen = new Date();

    var query = {
      identity: identity,
      username: username
    };

    DeviceModel.findOneAndUpdate(query, {
        $set: {
          identity: identity,
          username: username,
          bluetoothMAC: bluetoothMAC,
          btUUID: btUUID,
          type: type,
          name: deviceName,
          capabilities: capabilities,
          lastSeen: lastSeen
        }
      }, {
        upsert: true
      },
      next);
  };



  this.removeCapability = function (capabilityName) {

    var lastSeen = new Date();
    DeviceModel.find(function (err, devicemodels) {
      for (i in devicemodels) {
        if (devicemodels[i].capabilities && devicemodels[i].capabilities.indexOf(capabilityName) != -1) {
          devicemodels[i].capabilities.splice(devicemodels[i].capabilities.indexOf(capabilityName));
          devicemodels[i].save();
        }
      }
    });

  };



  this.updateOrCreateDevice = function (identity, bluetoothMAC, btUUID, username, type, capabilities) {

    var lastSeen = new Date();
    var query = {
      identity: identity
    };

    DeviceModel.findOneAndUpdate(query, {
      $set: {
        bluetoothMAC: bluetoothMAC,
        btUUID: btUUID,
        username: username,
        type: type,
        capabilities: capabilities,
        lastSeen: lastSeen
      }
    }, {
      upsert: true
    }, function (err, dev) {

      if (err) {
        log('error while userting DeviceModel: ' + err);
      }

    });

  };

  
  
  // Yes, this seems very complicated method!
  //  1) theUpserMethod updates metadata, and emits and update to apps and webui
  //  2) special metadata handlers:
  //    2.1) bt_devices_handler updates REPORTER device's metadata, and emits an update of this
  this.upsertMetadata = function (identity, newMetadata, next1) {

    
    
    // contains pub/sub data
    var publishThese = {};

    var theUpserMethod = function (identity, newMetadata, cb) {

      DeviceModel.findOne({
        identity: identity
      }, function (err, dev) {
        if (err)
          log('error while userting metadata for ' + identity + ':' + err);

        var deviceMetadata = dev.metadata;
        if (!deviceMetadata)
          deviceMetadata = {};

        for (newKey in newMetadata) {

          // publish only when metadata changes
          if (!deviceMetadata[newKey] || deviceMetadata[newKey] != newMetadata[newKey]) {

            var key = newKey; //newKey + '+' + identity;
            publishThese[key] = {
              deviceIdentity: identity,
              key: newKey,
              value: newMetadata[newKey],
              oldValue: deviceMetadata[newKey]
            };
          }
          // check the null issue!!
          deviceMetadata[newKey] = newMetadata[newKey];
        }

        DeviceModel.findOneAndUpdate({
          identity: identity
        }, {
          $set: {
            metadata: deviceMetadata,
          }
        }, {
          upsert: true
        }, function (err, dev) {
          if (err)
            log('error while userting metadata for ' + identity + ':' + err);

          // sending pubsub notifications
          for (key in publishThese) {
            // original:
            emitContextData(publishThese[key]);
          }

          // next
          cb();

        });

      });
    } // The upsertMethod end



    // check for special keys, like bt_devices. ( Could also filter these out from device updates )
    for (key in newMetadata) {
      if (key == 'bt_devices') {
        bt_devices_handler(identity, newMetadata[key]);
      }
    }


    theUpserMethod(identity, newMetadata, next1);


    // context data special handlers
    
    // 2) bt_devices_handler updates currently only reporter device's metadata!
    function bt_devices_handler(identity, btDevicesTuple) {

      function getRSSI(btMac) {
        for (index in btDevicesTuple) {
          if ((btDevicesTuple[index][0]).toLowerCase() == btMac.toLocaleLowerCase())
            return btDevicesTuple[index][1];
        }
      }

      var deviceBluetoothMacs = [];      
      for (index in btDevicesTuple) {
        deviceBluetoothMacs.push((btDevicesTuple[index][0]).toLowerCase());
      }
      
     
      // 2.0 registered and reported devices based on BT UUID first, then based on BT MAC
      //  So finds only the devices that were scanned and reported in bt_devices metadata. Then changes only the reporter's metadata.
      DeviceModel.find({
        btUUID: {
          $exists: true,
          $in: deviceBluetoothMacs
        }        
      }, function (err, deviceModels0) {

        // find based on BT MAC
        DeviceModel.find({
          bluetoothMAC: {
            $exists: true,
            $in: deviceBluetoothMacs
          }
        }, function (err, deviceModels1) {
          if (err) {
            log('error while handling context data for bt_devices: ' + err);
            return;
          }

          // Both, Bluetooth MAC and BLE uuid results.
          var deviceModels = deviceModels0.concat(deviceModels1);

          // Only BLE uuid results
          //var deviceModels = deviceModels1;
          var nearbyRegisteredDevices = [];
          for (i in deviceModels) {
            var rssi = getRSSI(deviceModels[i].bluetoothMAC) ? getRSSI(deviceModels[i].bluetoothMAC) : getRSSI(deviceModels[i].btUUID);
            var distance = HELPERS.rssiToM(rssi);

            if (distance > -1) {
              //log('nearby registered device: ' + deviceModels[i].identity + ': ' + rssi + ', m: ' + distance);
              nearbyRegisteredDevices.push([deviceModels[i].identity, distance]);
            }
          }


          // 2.1) Find the reporter device
          DeviceModel.findOne({
            identity: identity
          }, function (err, dev) {
            if (err || !dev)
              return;

            var deviceMetadata = dev.metadata;
            if (!deviceMetadata)
              deviceMetadata = {};

            deviceMetadata['proximityDevices'] = nearbyRegisteredDevices;

            // 2.2) update reporter device's proximityDevices metadata
            DeviceModel.findOneAndUpdate({
              identity: identity
            }, {
              $set: {
                metadata: deviceMetadata,
              }
            }, {
              upsert: true
            }, function (err, dev) {
              if (err)
                log('error while userting metadata for ' + identity + ':' + err);

              // sending pubsub notifications
              for (key in publishThese) {
                // original:
                emitContextData({
                  deviceIdentity: identity,
                  key: "proximityDevices",
                  value: nearbyRegisteredDevices,
                  oldValue: []
                });
              }

            }); // find and update the metadata

          }); // find to get metadata


        }); // bt mac
      }); //bt uuid
    } // bt_device_handler()


  };









  this.findDevicesBasedOnBluetooth = function (btMacs, callback) {
    DeviceModel.find({
      bluetoothMAC: {
        $in: btMacs
      }
    }, callback);
  };


  //db.devicemodels.remove({identity: "device:nikkis@s3mini"})

  this.findMultipleDevices = function (identities, callback) {
    DeviceModel.find({
      identity: {
        $in: identities
      }
    }, callback);
  };

  this.findAllDevices = function (callback) {
    DeviceModel.find(callback);
  };
}