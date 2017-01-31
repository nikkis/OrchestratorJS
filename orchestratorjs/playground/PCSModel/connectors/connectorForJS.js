// Receives data with Socket.IO (and later with HTTP)

var host = 'http://orchestratorjs.org';
var port = 9006;



var initializeConnector = function (pcsModel) {



    // Socket.IO client
    var socket = io(host + ':' + port);
    socket.on('connect', function () {

        log('connection to cloud broaker..');

        socket.emit('identify', pcsModel.model.identity);

        pcsModel.addDispatcher(function (eventName, identity, eventData) {
            log('sending seed');
            socket.emit(eventName, identity, eventData);
        });
    });

    socket.on('disconnect', function (deviceid) {
        console.log('disconnect from cloud broaker');
    });

    socket.on('seed_broadcast', function (identity, seedData) {
        log('seed received');
        pcsModel.newSeedReceived(identity, seedData);
    });

    socket.on('seed_broadcast_reply', function (identity, seedData) {
        log('seed to received');
        pcsModel.newSeedReceived(identity, seedData);
    });

    socket.on('data', function (deviceid, data) {
        log('Socket.IO data received:');
        log(deviceid);
        log(data);

        // Dispatch the received data to the PCS model
        pcsModel.dispatch(deviceid, data);
    });

};