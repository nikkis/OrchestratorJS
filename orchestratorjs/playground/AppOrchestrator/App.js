var config = require('../config.json');
var pubsub = require('socket.io-client').connect('http://' + config.server.host + ':' + config.services.ojsDeviceRegistry.port);

function p(line) {
    console.log(line);

}

module.exports = function App() {

    //var that = {};

    this.devices = {};
    this.actions = [];
    this.state = {};


    this.addAction = function addAction(triggeringEvents, appState, action) {

        var key;
        for (key in appState) {
            this.state[key + 'Changed'] = appState[key];
        }

        var i;
        for (i = 0; i < triggeringEvents.length; i += 1) {

            var eventName = triggeringEvents[i];
            var pos = this.actions.push(action) - 1;
            var action = this.actions[pos];

            pubsub.on(eventName, function (contextValue, deviceIdentity) {

                p('Event: ' + eventName + ' received from device: ' + deviceIdentity);


                // TODO: save all the received events, if config says so. Otherwise, save only the triggering events.

                // TODO: Improve this, check that action is allowed to access the certain app state
                if (triggeringEvents.indexOf(eventName) !== -1) {


                    // TODO: Save event, and broadcast to devices.

                    var Event = {
                        eventName: contextValue,
                        sender: this.devices[deviceIdentity]
                    };

                    this.state[eventName.split('Changed', 1)] = contextValue;
                    invokeAction(action, this, Event);
                }

            });
        }
    };

    this.addDevices = function (devices) {

    };


};