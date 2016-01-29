ROOT = process.cwd();
HELPERS = require(ROOT + '/helpers/general.js');
log = HELPERS.log

var config = require(ROOT + '/config.json');


// Database handlers
var UsersHandler = require(ROOT + '/Models/user.js');
var USERS = new UsersHandler();

var DeviceHandler = require(ROOT + '/Models/devicesHandler');
var DEVICE_HANDLER = new DeviceHandler();

var async = require('async');

var SEP = '....';

var SCRIPTS = module.exports = {


  addDeviceReferenceToUsers: function () {

    log('Adding references to user objects -- BEGIN');
    USERS.findAllUsers(function (err, userObjects) {
      async.forEachOf(userObjects, _updateDeviceRef, function (err) {
        log('Adding references to user objects -- END');
      });
    });


    function _updateDeviceRef(userObject, key, next) {
      DEVICE_HANDLER.findUserDevices(userObject.username, function (err, deviceObjects) {
        log(SEP + 'For user: ' + userObject.username);
        deviceObjects.forEach(function (devObj) {
          if (userObject.devices && userObject.devices.indexOf(devObj._id) === -1) {
            userObject.devices.push(devObj._id);
            userObject.save();
            log(SEP + SEP + 'Added ref to device: ' + devObj.identity);
          } else {
            log(SEP + SEP + 'Already contains ref to device: ' + devObj.identity);
          }
        });
        return next();
      });
    }
  },



  test: function () {
    USERS.findUser('nikkis', function (err, userObject) {
      log('found: ' + userObject.devices[0].toJson().username);
    });
  }



};



//SCRIPTS.addDeviceReferenceToUsers();

//SCRIPTS.test();