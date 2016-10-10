/*jslint node: true */



var ROOT = process.cwd();
var HELPERS = require(ROOT + '/helpers/general.js');
var log = HELPERS.log;

var config = require(ROOT + '/config.json');


// Database handlers
var UsersHandler = require(ROOT + '/Models/user.js');
var USERS = new UsersHandler();

var DeviceHandler = require(ROOT + '/Models/devicesHandler');
var DEVICE_HANDLER = new DeviceHandler();



var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

var ORCHESTRATOR_CORE = null;


var HttpResponsesModule = require(ROOT + '/Models/HttpResponses.js');
var HttpResponses = new HttpResponsesModule('user');


function userReturnObject(userModel) {
  var retObject = {};
  if (userModel) {
    retObject = {
      username: userModel.username,
      color: userModel.color
    };
  }
  if (config.admin_users.indexOf(userModel.username) !== -1) {
    retObject.admin = true;
  } else {
    retObject.admin = false;
  }
  return retObject;
}




function userDeviceReturnObj(deviceModel) {
  return {
    identity: deviceModel.identity,
    username: deviceModel.username,
    bluetoothMAC: deviceModel.bluetoothMAC,
    btUUID: deviceModel.btUUID,
    deviceType: deviceModel.type,
    deviceName: deviceModel.name,
    capabilities: deviceModel.capabilities,
    lastEdited: deviceModel.lastSeen
  };
}





module.exports = {

  initialize: function (orchestratorCore) {
    ORCHESTRATOR_CORE = orchestratorCore;
  },


  login: function (req, res) {

    var username = req.body.username,
      password = req.body.password;

    USERS.verifyUser(username, password, function (err, user) {

      if (user === null || !user || !user.username || user.username !== username) {
        res.send(401, 'unauthorized');
        return;
      }

      // initialize session

      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.write(
        JSON.stringify({
          //          'user': userReturnObject(user)
          user: user.toJSON()
        })
      );
      res.end();

    });
  },



  logout: function (req, res) {

    var username = req.body.username;

    // destroy session

    res.send('logged out');
  },



  getUser: function (req, res) {

    var username = req.params.username;

    USERS.findUser(username, function (err, user) {

      if (!user) {
        res.send(404, 'cannot find user ' + username);
        return;
      } else {

        HttpResponses.sendObject(res, user);
        return;
      }
    });
  },



  // post is for registering
  postUser: function (req, res) {

    var username = req.body.username,
      password = req.body.password;

    USERS.findUser(username, function (err, user) {

      if (user) {
        res.send(422, 'reserved username');
        return;
      }

      USERS.createUser(username, password, function (err, user) {

        if (err) {
          res.send(500, 'error while creating user: ' + err);
          return;
        }


        res.writeHead(200, {
          "Content-Type": "application/json"
        });
        res.write(
          JSON.stringify({
            'user': userReturnObject(user)
          })
        );
        res.end();


      });

    });
  },


  // put is for editing user
  putUser: function (req, res) {

    var username = req.body.username,
      password = req.body.password;

    USERS.findUser(username, function (err, user) {

      if (user) {
        res.send(404, 'User not found!');
        return;
      }

      // TODO: SoMe data
      /*
      var soMeData = req.body.soMeData;
      if (soMeData) {}*/

      HttpResponses.sendObject(res, user);
      return;
    });

  },




  deleteUser: function (req, res) {
    var username = req.params.username;
    res.send('user delete not implemented!');
  },



  getDevice: function (req, res) {
    //var identity     = req.params.deviceIdentity;
    var deviceName = req.params.deviceName,
      username = req.params.username,
      identity = username + '@' + deviceName;

    DEVICE_HANDLER.findDevice(identity, function (err, device) {

      if (err) {
        res.send(500, 'cannot get device ' + err);
        return;
      }

      if (!device) {
        res.send(404, 'cannot find device ' + identity);
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.write(
        JSON.stringify(
          userDeviceReturnObj(device)
        )
      );
      res.end();
    });
  },

  postDevice: function (req, res) {

    //var identity     = req.params.deviceIdentity;
    var deviceName = req.params.deviceName,
      username = req.params.username,
      identity = username + '@' + deviceName;


    USERS.findUser(username, function (err, user) {

      if (!user) {
        res.send(404, 'cannot find user ' + username);
        return;
      } else {


        var bluetoothMAC = req.body.bluetoothMAC || '',
          btUUID = req.body.btUUID || '',
          deviceType = req.body.deviceType,
          capabilities = req.body.capabilities;


        DEVICE_HANDLER.upsertDevice(identity, username, bluetoothMAC, btUUID, deviceType, deviceName, capabilities, function (err, device) {

          if (err) {
            log('Cannot create device: ' + err);
            res.send(500, 'cannot post device ' + err);
            return;
          }

          if (!device.btUUID) {
            log('not yet UUID -> generate + save');
            device.btUUID = HELPERS.getUUID();
            device.save();
            log('saved UUID');
          }


          // Add device for the user
          var currentDeviceIds = HELPERS.arrayOfKeys('identity', user.devices);
          if (user.devices && currentDeviceIds.indexOf(device.identity) === -1) {
            user.devices.push(device._id);
            user.save();
          }

          log('Device (' + device.identity + ') created');
          res.writeHead(200, {
            "Content-Type": "application/json"
          });
          res.write(
            JSON.stringify(
              userDeviceReturnObj(device)
            )
          );
          res.end();
        });


      }
    });


  },


  deleteDevice: function (req, res) {
    var deviceName = req.params.deviceName,
      username = req.params.username,
      identity = username + '@' + deviceName;


    USERS.findUser(username, function (err, user) {

      if (!user) {
        res.send(404, 'cannot find user ' + username + '\n');
        return;
      } else {

        log('removing device: ' + identity);
        DEVICE_HANDLER.removeDevice(identity, function (err, data) {
          if (err) {
            res.send('Cannot remove device: ' + err + '\n');
            return;
          } else {

            var currentDeviceIds = HELPERS.arrayOfKeys('identity', user.devices),
              indx = currentDeviceIds.indexOf(identity);
            if (currentDeviceIds.indexOf(identity) !== -1) {
              user.devices.pop(indx);
              user.save();
            }
            res.send('Device: ' + identity + ' removed');
            return;
          }
        });
      }
    });
  },



  getProximityGraph: function (req, res) {

    var deviceName = req.params.deviceName,
      username = req.params.username,
      identity = username + '@' + deviceName,

      jsonGraph = {};


    DEVICE_HANDLER.findDevice(identity, function (err, device) {

      if (err) {
        res.send(500, 'cannot get device ' + err);
        return;
      }

      if (!device) {
        res.send(404, 'cannot find device ' + identity);
        return;
      }

      var nodes = [],
        links = [],
        i,
        pDevId,
        pDevDistance;

      nodes.push({
        "className": identity.replace('@', 'AT'),
        "name": identity,
        "group": 1,
        "size": 10
      });

      for (i in device.metadata.proximityDevices) {
        pDevId = device.metadata.proximityDevices[i][0];
        pDevDistance = device.metadata.proximityDevices[i][1];

        nodes.push({
          "className": pDevId.replace('@', 'AT'),
          "name": pDevId,
          "group": i + 1,
          "size": 7
        });
        links.push({
          "devName": pDevId,
          "source": parseInt(i, 0) + 1,
          "target": 0,
          "value": pDevDistance
        });
      }

      jsonGraph = {};
      jsonGraph.nodes = nodes;
      jsonGraph.links = links;

      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.write(
        JSON.stringify(
          jsonGraph
        )
      );
      res.end();


    });



  }



};