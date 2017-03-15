// Receives data with Socket.IO (and later with HTTP)

var host = 'http://orchestratorjs.org';
var port = 9006;



var initializeConnector = function (hdModel) {



    // Socket.IO client
    var socket = io(host + ':' + port);
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

    /////////// AWARENESS

    socket.on('seed_broadcast', function (identity, seedData) {
        log('seed_broadcast received');
        hdModel.newSeedBroadcastReceived(identity, seedData);
    });

    socket.on('seed_broadcast_reply', function (identity, seedData) {
        log('seed_broadcast_reply received');
        hdModel.newSeedBroadcastReplyReceived(identity, seedData);
    });


    /////////// DATA

    socket.on('data', function (deviceid, data) {
        log('Socket.IO data received:');
        log(deviceid);
        log(data);

        // Dispatch the received data to the HD model
        hdModel.dispatch(deviceid, data);
    });

};