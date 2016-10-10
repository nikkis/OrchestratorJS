/*jslint node: true */


var ROOT = process.cwd();
var HELPERS = require(ROOT + '/helpers/general.js');
var log = HELPERS.log;


var config = require(ROOT + '/config.json');

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/' + config.database);

var DeviceHandler = require(ROOT + '/Models/devicesHandler');
var DEVICE_HANDLER = new DeviceHandler();


var userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  color: {
    type: String
  },
  edited: {
    type: Date,
    default: Date.now
  },

  soMeData: {
    type: {}
  },

  devices: [{
    type: ObjectId,
    ref: 'DeviceModel',
    unique: true
  }]

});

var LINK_PATH_PREFIX = '/users/';



// Own version of toJSON method for formatting links for the child elements
userSchema.methods.toJson = function () {

  var userObject = this.toObject(),
    tempDevices = [],
    i;
  for (i = 0; i < userObject.devices.length; i++) {
    userObject.devices[i].toJson = DEVICE_HANDLER.toJsonMethod;
    tempDevices.push(userObject.devices[i].toJson());
  }

  var response = {
    username: userObject.username ? userObject.username : null,
    color: userObject.color ? userObject.color : null,
    edited: userObject.edited ? userObject.edited : null,
    soMeData: userObject.soMeData ? userObject.soMeData : {},
    devices: tempDevices
  };

  return response;
};


userSchema.methods.getLink = function () {
  var userObject = this.toObject();
  return LINK_PATH_PREFIX + userObject.username;
};




var UserModel = mongoose.model('UserModel', userSchema);



module.exports = function UserHandler() {
  return {

    findUser: function (username, next) {
      UserModel.findOne({
        username: username
      }).populate('devices').exec(function (err, userObject) {

        /*
        var tempDevices = [];
        for (var i = 0; i < userObject.devices.length; i++) {
          userObject.devices[i].toJson = DEVICE_HANDLER.toJsonMethod;
          tempDevices.push(userObject.devices[i]);
        }
        userObject.devices = tempDevices;
        */

        next(err, userObject);
      });
    },



    verifyUser: function (username, password, next) {
      UserModel.findOne({
        username: username,
        password: password
      }, next);
    },

    createUser: function (username, password, next) {
      var color = HELPERS.hexColor(username);
      var edited = new Date();
      var user = {
        username: username,
        password: password,
        color: color,
        edited: edited
      };

      UserModel.create(user, next);

    },

    upsertUserSoMeData: function (username, soMeData, next) {

      var query = {
        username: username
      };

      UserModel.findOneAndUpdate(query, {
        $set: {
          username: username,
          soMeData: soMeData
        }
      }, {
        upsert: true
      }, function (err, data) {
        if (!err) {} else {
          log('error while userting user SoMeData: ' + err);
        }

        next(err, data);
      });


    },

    findAllUsers: function (callback) {
      UserModel.find(callback);
    }


  }

}