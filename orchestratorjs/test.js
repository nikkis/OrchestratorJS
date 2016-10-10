function p(line) {
    console.log(line);
}

var Action = function (name) {
    this.name = name;
    p('this.name: ' + this.name);
};

function constructAction(App, Event) {

    var that = new Action('PhotoShareAction');

    that.roles = {
        source: null,
        sinks: null
    };

    that.casting = function (App, Event) {
        that.roles.source = Event.sender;
        that.roles.sinks = App.devices
            .hasCapability('PhotoSharing')
            .isInState('PhotoSharing.isReadyToView')
            .notEquals([that.roles.source]);
        return;
    };


    that.guard = function (roles) {

        return (App.currentPhoto &&
            forAll(roles.sinks, sink.photoSharing.isReadyToView));
    };


    that.body = function (roles) {

        var i;
        for (i = 0; i < roles.sinks.length; i += 1) {

            roles.sinks[i].photoSharing.setCurrentPhoto(App.currentPhoto);

        }

        App.currentPhoto = null;

    };

    return that;
};


var App,
    Event,
    action;





var allAppDevices = {
    'nikkis@iphone7': {
        capabilities: {
            talkingCapability: {
                say: function (line) {
                    p('Just saying..');
                }
            },
            photoSharing: {
                sharePhoto: function (line) {
                    p('Just saying..');
                }
            }
        }
    },
    'teppo@iphone6': {
        capabilities: {
            talkingCapability: {
                say: function (line) {
                    p('Just saying..');
                }
            }
        }
    }
};

var appDevices = function (currentDevices) {

    var that = {};


    that.hasCapability = function (capabalityName) {
        var limitedDeviceSet = {};
        var i,
            deviceIds = Object.keys(currentDevices);
        for (i = 0; i < deviceIds.length; i += 1) {
            if (currentDevices[deviceIds[i]].capabilities.hasOwnProperty(capabalityName)) {
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

    that.test = function () {
        console.log('bar');
        var limitedDeviceSet = currentDevices;
        return appDevices(limitedDeviceSet);
    };


    return that;
};


var devices = appDevices(allAppDevices);
devices.test();



App = {
    devices: devices
};
Event = {};
action = constructAction(App, Event);
action.casting(App, Event);




/*
var pubsub      = require( 'tools.js' ).pubsub();
var Action      = require( 'tools.js' ).Action;

module.exports = {

    // These optional preferences are set by the user when app starts
    preferences: [ companionDeviceId ],

    schedulingLogic: function() {

        // Initialize the share photo action
        var action           = Action.create('PhotoShareAction');
        var appState         = {'currentPhoto': null, 'currentPhotoOwner': null};
        var triggeringEvents = ['currentPhotoChanged'];
        App.actions.add(triggeringEvents, appState, action);

        // Rest of the action initializations omitted for brevity
    }
};
*/