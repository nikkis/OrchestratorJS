var log = console.log;
log('Physical-Cyber-Social model');

// TODO: Enable defining PCS_event_type

// TODO: Enable receiving heteregeneous raw data and events from various sources with various protocols and connectivity types

// TODO: Enable generating PCS events based on the predefined PCS_event_type s from the received raw data and events

// TODO: Relay the generated PCS event to subsribers

// TODO: import connector based on the environment


var PCSModel = function () {

    var model = {

        knownBLEDevices: {
            "717f860e-f0e6-4c93-a4e3-cc724d27e05e": "nikkis@iphone",
            "5bf2e050-4730-46de-b6a7-2c8be4d9fa36": "nikkis@iphone5",
            "8b034f7b-fa9b-540f-acf3-88c0ca70c84f": "nikkis@ibeacon"
        },

        knownCompanionDevices: {
            "717f860e-f0e6-4c93-a4e3-cc724d27e05e": "nikkis@iphone",
        },

        proxemicUsers: {},
        proxemicDevices: {},

        unknownProxemicDevices: {}
    };

    var dataHandlers = {};

    var connectors = {};
    var that = {};

    function initializePCS() {
        log('Initializing Physical-Cyber-Social model');
    };


    that.addInputDataHandler = function (dataType, handlerMethod) {
        dataHandlers[dataType] = handlerMethod;
        log('handler addded for: ' + dataType);
    };


    that.addPCSEventGenerator = function (pcsEventType, handlerMethod) {


    };


    that.dispatch = function (senderId, inputData) {

        log('PCS data received:');
        log(inputData);

        var
            i,
            keysOfReceivedData = Object.keys(inputData);
        for (i = 0; i < keysOfReceivedData.length; i += 1) {

            var dataType = keysOfReceivedData[i];
            if (Object.keys(dataHandlers).indexOf(dataType) !== -1) {

                log('Handling data for key: ' + dataType);
                dataHandlers[dataType](model, inputData[dataType]);
            }

            // TODO: check data type (PCS_event_types define also the input data)

            // TODO: merge to the model
        }
    };


    // Starts the whole thing
    that.startPCS = function () {
        log('Starting PCS..');
        initializePCS();
    };

    return that;
};


var NodeJSConnector = require('./connectors/nodeJSConnector.js');




var pcsModel = PCSModel();
pcsModel.startPCS();



pcsModel.addInputDataHandler('facebook_friends', function (pcsModel, facebookFriends) {

    pcsModel.facebookFriends = facebookFriends;

    // TODO: use here real fb data

});


pcsModel.addInputDataHandler('ble_devices', function (pcsModel, proximitySet) {

    pcsModel.proxemicDevices = {};
    pcsModel.proxemicUsers = {};

    var
        measurementIndex,
        measuredUsername,
        measuredDeviceId,
        unknownDevicesIndex = 0;
    for (measurementIndex = 0; measurementIndex < proximitySet.length; measurementIndex += 1) {

        var bleIdentity = proximitySet[measurementIndex][0];
        var rssiValue = proximitySet[measurementIndex][1];

        if (Object.keys(pcsModel.knownBLEDevices).indexOf(bleIdentity) !== -1) {

            measuredDeviceId = pcsModel.knownBLEDevices[bleIdentity];

            if (Object.keys(pcsModel.knownCompanionDevices).indexOf(bleIdentity) !== -1) {
                measuredUsername = measuredDeviceId.split('@', 1);
                pcsModel.proxemicUsers[measuredUsername] = rssiValue;
            }

            pcsModel.proxemicDevices[measuredDeviceId] = rssiValue;

        } else {
            // unknown device
            pcsModel.unknownProxemicDevices["unknown_" + unknownDevicesIndex] = rssiValue;
            unknownDevicesIndex += 1;
        }
    }
});

pcsModel.addInputDataHandler('gps_coordinates', function (pcsModel, coordinates) {

    pcsModel.locationGPS = {};
    pcsModel.locationGPS['latitude'] = coordinates[0];
    pcsModel.locationGPS['longitude'] = coordinates[1];

});



var nodeJSConnector = NodeJSConnector(pcsModel);