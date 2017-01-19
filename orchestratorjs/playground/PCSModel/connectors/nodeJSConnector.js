// Receives data with Socket.IO (and later with MQTT and HTTP) and then dispatches PCS

//var host = 'http://localhost'
var host = 'http://orchestratorjs.org';
var port = 9006;
var pcsIdentity = 'nikkis@pcs';


var log = console.log;

var PCSmodel;


var Socket = require('socket.io-client');




var initializeConnector = function (pcsModel) {


    // Socket.IO client
    var socket = Socket.connect(host + ':' + port);
    socket.on('connect', function () {
        log('connection');
        socket.emit('identify', pcsIdentity);
    });

    socket.on('disconnect', function (deviceid) {
        console.log('disconnect');
    });

    socket.on('pcs_data', function (deviceid, data) {
        log('Socket.IO data received:');
        log(deviceid);
        log(data);

        // Dispatch the received data to the PCS model
        pcsModel.dispatch(deviceid, data);
    });

};


module.exports = initializeConnector;