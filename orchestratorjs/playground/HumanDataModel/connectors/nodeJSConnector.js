// Receives data with Socket.IO (and later with MQTT and HTTP) and then dispatches HD model

//var host = 'http://localhost'
var host = 'http://orchestratorjs.org';
var port = 9006;
var hdIdentity = 'alice@hd';


var log = console.log;

var HDmodel;


var Socket = require('socket.io-client');




var initializeConnector = function (hdModel) {

    /*
        // Socket.IO client
        var socket = Socket.connect(host + ':' + port);
        socket.on('connect', function () {
            log('connection');
            socket.emit('identify', hdIdentity);
        });

        socket.on('disconnect', function (deviceid) {
            console.log('disconnect');
        });

        socket.on('hd_data', function (deviceid, data) {
            log('Socket.IO data received:');
            log(deviceid);
            log(data);

            // Dispatch the received data to the HD model
            hdModel.dispatch(deviceid, data);
        });
    */

    // Socket.IO client
    var socket = Socket.connect(host + ':' + port);
    socket.on('connect', function () {

        log('connection to cloud broaker..');

        socket.emit('identify', hdModel.model.identity);

        hdModel.addDispatcher(function (eventName, identity, eventData) {
            log('sending seed');
            socket.emit(eventName, identity, eventData);
        });
    });

    socket.on('disconnect', function (deviceid) {
        console.log('disconnect from cloud broaker');
    });

    socket.on('seed_broadcast', function (identity, seedData) {
        log('seed_broadcast received');
        hdModel.newSeedBroadcastReceived(identity, seedData);
    });

    socket.on('seed_broadcast_reply', function (identity, seedData) {
        log('seed_broadcast_reply received');
        hdModel.newSeedBroadcastReplyReceived(identity, seedData);
    });

    socket.on('data', function (deviceid, data) {
        log('Socket.IO data received:');
        log(deviceid);
        log(data);

        // Dispatch the received data to the HD model
        hdModel.dispatch(deviceid, data);
    });
};


module.exports = initializeConnector;