var config = require('../../config.json');
var pubsub = require('socket.io-client').connect('http://' + config.server.host + ':' + config.services.ojsDeviceRegistry.port);


function p(line) {
    console.log(line);
}

const util = require('util');

function ins(o) {
    console.log('INS:\n' + util.inspect(o, {
        showHidden: true,
        depth: null
    }));
}





var allAppDevices = {
    'alice@iphone': {

        talkingCapability: {
            say: function (line) {
                p('Just saying..');
            }
        },

        photoSharing: {
            sharePhoto: function (line) {
                p('Just saying..');
            },
            setCurrentPhoto: function (photoUrl) {
                p('setting current photo to: ' + photoUrl);
            }
        }

    },
    'teppo@iphone6': {

        talkingCapability: {
            say: function (line) {
                p('Just saying..');
            }
        }

    }
};

var appDevices = function (currentDevices) {

    var that = {};


    // add the devices to this
    var key;
    for (key in currentDevices) {
        that[key] = currentDevices[key];
    }


    that.hasCapability = function (capabalityName) {
        var limitedDeviceSet = {};
        var i,
            deviceIds = Object.keys(currentDevices);
        for (i = 0; i < deviceIds.length; i += 1) {
            if (currentDevices[deviceIds[i]].hasOwnProperty(capabalityName)) {
                limitedDeviceSet[deviceIds[i]] = currentDevices[deviceIds[i]];
            }
        }
        return appDevices(limitedDeviceSet);
    };




    // TODO: Coalescence and disintegration
    that.isInState = function (capabalityName) {
        var limitedDeviceSet = currentDevices;
        return appDevices(limitedDeviceSet);
    };




    that.notEquals = function (obejctsArray) {
        var limitedDeviceSet = {};
        var i,
            deviceIds = Object.keys(currentDevices);
        for (i = 0; i < deviceIds.length; i += 1) {

            // TODO: go through the list and filter out the devices that are equal
            if (currentDevices[deviceIds[i]].capabilities.hasOwnProperty(capabalityName)) {
                limitedDeviceSet[deviceIds[i]] = currentDevices[deviceIds[i]];
            }

        }
        return appDevices(limitedDeviceSet);
    };


    return that;
};








var invokeAction = function (action, app, event) {

    p('InvokingAction: ' + action.name);

    p("...Executing Action's Casting");
    var roles = action.casting(event);

    p("...Executing Action's Guard");
    action.guard(roles);

    p("...Executing Action's Body");
    action.body(roles);

};








var App = function App() {
    this.devices = {};
    this.actions = [];
    this.state = {};
};

App.prototype.getDevice = function getDevice(app, deviceIdentity) {
    return this.devices[deviceIdentity];
};

App.prototype.addAction = function addAction(triggeringEvents, appState, action) {

    var key;
    for (key in appState) {
        this.state[key + 'Changed'] = appState[key];
    }

    var i;
    for (i = 0; i < triggeringEvents.length; i += 1) {

        var eventName = triggeringEvents[i];
        var pos = this.actions.push(action) - 1;
        var action = this.actions[pos];

        var thisApp = this;

        action.App = thisApp;

        pubsub.on(eventName, function (contextValue, deviceIdentity) {

            p('Event: ' + eventName + ' received from device: ' + deviceIdentity);
            var senderDevice = thisApp.getDevice(thisApp, deviceIdentity);

            // TODO: Improve this, check that action is allowed to access the certain app state
            if (triggeringEvents.indexOf(eventName) !== -1) {

                var Event = {
                    eventName: contextValue,
                    sender: senderDevice
                };

                thisApp.state[eventName.split('Changed', 1)] = contextValue;
                invokeAction(action, thisApp, Event);
            }

        });
    }
};

App.prototype.addDevices = function addDevices(devices) {
    this.devices = devices;
};

var devs = appDevices(allAppDevices);

var PhotoSharingApp = require('./Apps/PhotoSharingApp.js');

PhotoSharingApp.prototype = new App();
var app = new PhotoSharingApp();
app.addDevices(devs);