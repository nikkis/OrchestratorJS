// Receives data with Socket.IO (and later with MQTT and HTTP) and then dispatches PCS

var port = 9006;
var pcsIdentity = 'alice@pcs';


var log = console.log;

var PCSmodel;


var socket = require('socket.io');

var express = require('express');
var APP = express();
APP.use(express.bodyParser());




var initializeConnector = function (pcsModel) {

    // HTTP
    var server = APP.listen(port);

    // Socket.IO
    var io = socket.listen(server);
    io.sockets.on('connection', function (socket) {
        log('connection');

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
    });


    // TODO: MQTT

};


module.exports = initializeConnector;