var log = console.log;
log('Physical-Cyber-Social model');

function isNode() {
    return (typeof module !== 'undefined' && module.exports);
}


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
            "8b034f7b-fa9b-540f-acf3-88c0ca70c84f": "nikkis@ibeacon",
            "FB694B90-F49E-4597-8306-171BBA78F844": "nikkis@mac"
        },

        knownCompanionDevices: {
            "717f860e-f0e6-4c93-a4e3-cc724d27e05e": "nikkis@iphone",
        },

        proxemicUsers: {},
        proxemicDevices: {},

        unknownProxemicDevices: {}
    };

    var inputListeners = {};
    var eventGenerators = {};
    var dataToEventsMappings = {};

    var connectors = {};
    var that = {};

    function initializePCS() {
        log('Initializing Physical-Cyber-Social model');
    };


    that.addInputListener = function (dataType, handlerMethod) {
        inputListeners[dataType] = handlerMethod;
        log('handler addded for: ' + dataType);
    };


    that.addEventGenerator = function (eventType, triggeringInputDataTypes, maxInterval, generatorMethod) {
        log('adding new event generator: ' + eventType);

        // name: when last called, function to call, maxInterval (how often can be invoked)
        eventGenerators[eventType] = {
            lastCalled: null,
            generator: generatorMethod,
            maxInterval: maxInterval
        };

        log(triggeringInputDataTypes);
        var
            index,
            inputDataType;
        for (index in triggeringInputDataTypes) {
            inputDataType = triggeringInputDataTypes[index];
            if (!dataToEventsMappings[inputDataType]) {
                dataToEventsMappings[inputDataType] = [];
            }
            dataToEventsMappings[inputDataType].push(eventType);
        }

        log(dataToEventsMappings);
    };


    that.dispatch = function (senderId, inputData) {

        log('PCS data received:');
        log(inputData);

        var
            i,
            keysOfReceivedData = Object.keys(inputData);
        for (i = 0; i < keysOfReceivedData.length; i += 1) {

            var dataType = keysOfReceivedData[i];
            if (Object.keys(inputListeners).indexOf(dataType) !== -1) {

                log('Handling data for key: ' + dataType);
                inputListeners[dataType](model, inputData[dataType]);

                // invoke the event generators

                var j,
                    eventGeneratorKeys = dataToEventsMappings[dataType];
                log(eventGeneratorKeys);
                for (j = 0; j < eventGeneratorKeys.length; j += 1) {
                    key = eventGeneratorKeys[j];
                    var generatorInfo = eventGenerators[key];
                    log('BAR');

                    log(generatorInfo);

                    // TODO: check the interval

                    // invoke method
                    var eventToPublish = generatorInfo.generator();

                    // publish for the subscribers


                }

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


/// Initialize

var pcsModel = PCSModel();
pcsModel.startPCS();



pcsModel.addInputListener('facebook_friends', function (pcsModel, facebookFriends) {

    pcsModel.facebookFriends = facebookFriends;

    // TODO: use here real fb data

});


pcsModel.addInputListener('ble_devices', function (pcsModel, proximitySet) {

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

pcsModel.addInputListener('gps_coordinates', function (pcsModel, coordinates) {

    pcsModel.locationGPS = {};
    pcsModel.locationGPS['latitude'] = coordinates[0];
    pcsModel.locationGPS['longitude'] = coordinates[1];

});


// pcs event type (name), array of inputs that trigger the generator, interval in seconds (how fast/often the generator can be called)
pcsModel.addEventGenerator('social_proximity_set', ['ble_devices', 'facebook_friends'], 3, function (pcsModel) {

    // the the fb data
    console.log('SOCIAL PROXIMITY GRAPH CHANGED EVENT');
    var event = {};
    return event;
});


// pcs event type (name), array of inputs that trigger the generator, interval in seconds (how fast/often the generator can be called)
pcsModel.addEventGenerator('location', ['gps_coordinates'], 3, function (pcsModel) {

    // Generate location output events

    console.log('LOCATION CHANGED EVENT');
    var event = {};

    return event;
});



/// Start


var connector;
if (isNode()) {

    log('Node.js');

    var NodeJSConnector = require('./connectors/nodeJSConnector.js');
    connector = NodeJSConnector(pcsModel);

} else {

    log('NOT Node.js');
    pcsModel.asdf = "22";
    requirejs(["connectors/connectorForJS"], function (connector) {
        initializeConnector(pcsModel);
    });

}