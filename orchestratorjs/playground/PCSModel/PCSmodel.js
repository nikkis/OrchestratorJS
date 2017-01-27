// PHASE 1: data input filtering and handling
// PHASE 2: higher level event generators
// PHASE 3: event callbacks    


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

        identity: "nikkis@pcs",

        // Facebook data set dynamically when received from client

        facebookID: "",
        facebookName: "",
        facebookFriends: [],

        /*
                facebookID: "140151603157984",
                facebookName: "Niko Mäkitalo",
                facebookFriends: [
                    "102684690214746",
                    "117525188729419",
                    "119560198524790",
                    "120144918465781"
                ],
        */
        // Ble data

        bleUUID: "FB694B90-F49E-4597-8306-171BBA78F844",

        knownBLEDevices: {
            "717f860e-f0e6-4c93-a4e3-cc724d27e05e": "nikkis@iphone",
            "5bf2e050-4730-46de-b6a7-2c8be4d9fa36": "nikkis@iphone5",
            "8b034f7b-fa9b-540f-acf3-88c0ca70c84f": "nikkis@ibeacon",
            "FB694B90-F49E-4597-8306-171BBA78F844": "nikkis@mac"
        },

        knownCompanionDevices: {
            "717f860e-f0e6-4c93-a4e3-cc724d27e05e": "nikkis@iphone"
        },


        proxemicUsers: {},
        proxemicDevices: {},

        unknownProxemicDevices: {}
    };

    // PHASE 1
    var inputListeners = {};

    // PHASE 2
    var eventUpdateTimes = {};
    var eventGenerators = {};
    var dataToEventsMappings = {};

    // PHASE 3
    var eventCallbacks = {
        'local': {}
    };

    var connectors = {};
    var that = {};


    var remoteDispatcher;



    // PUBLIC METHODS

    // INITIALIZING

    // Starts the whole thing
    that.startPCS = function () {
        log('Starting PCS..');
        initializePCS();
    };


    // PHASE 1

    that.addInputListener = function (inputDataType, inputListener) {
        inputListeners[inputDataType] = inputListener;
        log('Input listener addded for: ' + inputDataType);
    };


    // PHASE 2

    that.addEventGenerator = function (eventType, triggeringInputDataTypes, maxInterval, validTime, generatorMethod) {
        log('Event generator for: ' + eventType);

        // name: when last called, function to call, maxInterval (how often can be invoked)
        eventGenerators[eventType] = {
            lastCalled: null,
            generator: generatorMethod,
            maxInterval: maxInterval,
            validTime: validTime
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


    // PHASE 3

    that.addCallbackForEvent = function (eventName, callback) {
        log('Call back for event: ' + eventName);

        if (!eventGenerators[eventName]) {
            throw "Cannot add callback: Unknown event type: " + eventName;
        }

        // For direct/local subsribers
        eventCallbacks['local'][eventName] = callback;

    };




    //////////// DISPATCHER - MAIN METHOD


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
                    key,
                    eventGeneratorKeys = dataToEventsMappings[dataType];
                log(eventGeneratorKeys);
                for (j = 0; j < eventGeneratorKeys.length; j += 1) {
                    key = eventGeneratorKeys[j];
                    var generatorInfo = eventGenerators[key];


                    // TODO: check the interval


                    // invoke method
                    var eventToPublish = generatorInfo.generator(model);
                    //model[key] = eventToPublish.eventValue;
                    eventUpdateTimes[key] = Date.now();

                    // publish to local
                    var localCallbackForEvent = eventCallbacks['local'][key];
                    if (!localCallbackForEvent) {
                        return;
                    }

                    // Add the md5 so that the client can decide if it reacts to the event
                    var oldMD5 = getHashForEventType(key);
                    eventToPublish.md5 = oldMD5;

                    localCallbackForEvent(eventToPublish);


                    // TODO: publish for global subscribers


                    // check for validity

                    setTimeout(function () {
                        var newMD5 = getHashForEventType(key);
                        if (eventUpdateTimes[key] && newMD5 === oldMD5) {
                            log('SAME VALUE TOO LONG (' + generatorInfo.validTime + '): ' + oldMD5 + ' vs. ' + newMD5);
                            model[key] = {};
                            var eventToPublish = {
                                eventType: key,
                                eventValue: model[key]
                            };

                            localCallbackForEvent(eventToPublish);
                        }
                    }, generatorInfo.validTime * 1000);


                }

            }

            // TODO: check data type (PCS_event_types define also the input data)

            // TODO: merge to the model
        }
    };


    that.addDispatcher = function (dispatcherMethod) {
        remoteDispatcher = dispatcherMethod;
    }

    that.dispatchSeed = function () {
        remoteDispatcher(model.identity, 'pcs_seed', {
            identity: model.identity,
            facebookID: model.facebookID,
            bleUUID: model.bleUUID
        });
    }



    // PRIVATE METHODS

    function initializePCS() {
        log('Initializing Physical-Cyber-Social model');
        that.model = model;
    }


    function getHashForEventType(eventType) {
        var datadataJsonString = model[eventType] ? JSON.stringify(model[eventType]) : '';
        var lastUpdateTime = eventUpdateTimes[eventType];
        return md5(datadataJsonString + lastUpdateTime);
    }


    return that;
};









/// Initialize

var pcsModel = PCSModel();
pcsModel.startPCS();


////////// PHASE 1

pcsModel.addInputListener('facebook_friends', function (theModel, facebookFriends) {

    theModel.facebookFriends = facebookFriends;

    // TODO: use here real fb data

});


pcsModel.addInputListener('ble_devices', function (theModel, proximitySet) {

    theModel.proxemicDevices = {};
    theModel.proxemicUsers = {};

    var
        measurementIndex,
        measuredUsername,
        measuredDeviceId,
        unknownDevicesIndex = 0,
        bleIdentity,
        rssiValue;
    for (measurementIndex = 0; measurementIndex < proximitySet.length; measurementIndex += 1) {

        bleIdentity = proximitySet[measurementIndex][0];
        rssiValue = proximitySet[measurementIndex][1];

        if (Object.keys(theModel.knownBLEDevices).indexOf(bleIdentity) !== -1) {

            measuredDeviceId = theModel.knownBLEDevices[bleIdentity];

            if (Object.keys(theModel.knownCompanionDevices).indexOf(bleIdentity) !== -1) {
                measuredUsername = measuredDeviceId.split('@', 1);
                theModel.proxemicUsers[measuredUsername] = rssiValue;
            }

            theModel.proxemicDevices[measuredDeviceId] = rssiValue;

        } else {
            // unknown device
            theModel.unknownProxemicDevices["unknown_" + unknownDevicesIndex] = rssiValue;
            unknownDevicesIndex += 1;
        }
    }
});

pcsModel.addInputListener('gps_coordinates', function (theModel, coordinates) {
    theModel.location = {};
    theModel.location['latitude'] = coordinates.latitude;
    theModel.location['longitude'] = coordinates.longitude;
});



////////// PHASE 2



// pcs event type (name), array of inputs that trigger the generator, interval in seconds (how fast/often the generator can be called)
pcsModel.addEventGenerator('social_proximity_set', ['ble_devices', 'facebook_friends'], 3, 5, function (theModel) {

    // the the fb data
    console.log('SOCIAL PROXIMITY GRAPH CHANGED EVENT');
    var event = {};
    return event;
});


// pcs event type (name), array of inputs that trigger the generator, interval in seconds (how fast/often the generator can be called)
pcsModel.addEventGenerator('location', ['gps_coordinates'], 3, 10, function (theModel) {

    // Generate location output events

    var event = {
        eventType: 'location',
        eventValue: {
            location: {
                latitude: theModel.location.latitude,
                longitude: theModel.location.longitude
            }
        }
    };

    return event;
});



/// Start


var connector;
if (isNode()) {

    log('Node.js');

    var NodeJSConnector = require('./connectors/nodeJSConnector.js');
    connector = new NodeJSConnector(pcsModel);

} else {

    log('NOT Node.js');

    requirejs(["connectors/connectorForJS", "libs/md5"], function (connector) {
        initializeConnector(pcsModel);

        setTimeout(function () {
            pcsModel.dispatchSeed();
        }, 2000);

    });

}