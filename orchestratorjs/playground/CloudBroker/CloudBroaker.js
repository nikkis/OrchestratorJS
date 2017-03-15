var PORT = 9006;
var log = console.log;

var Server = require('socket.io');
var io = new Server(PORT);

// For now, simply receives events, and relays them to all clients

// Structure: 
/*{
    username: {
        deviceConnections: {
            deviceIdentity: < socket >
        },
        hdConnection: < socket >
    }
}*/
var HD_CONNECTION_POOL = {};
var DEVICE_CONNECTION_POOL = {};


function getConnectionInformation(deviceIdentity) {
    var parts = deviceIdentity.split('@', 2);
    if (deviceIdentity.indexOf('@') === -1) {
        throw ("Malformed device identity");
    }

    var type = 'device';
    if (parts[1].toLowerCase() === 'hd') {
        type = 'hd';
    }

    return {
        user: parts[0],
        deviceIdentity: deviceIdentity,
        type: type
    };
}

function getHDconnection(username) {

    var hdConnectionSocket = HD_CONNECTION_POOL[username];
    if (!hdConnectionSocket) {
        throw 'No HD Connection'
    }
    return hdConnectionSocket;
}


function removeConnection(socket) {
    var
        removeThisDeviceConnection = null,
        device_id = null;
    for (device_id in DEVICE_CONNECTION_POOL) {
        if ((DEVICE_CONNECTION_POOL[device_id]).id == socket.id) {
            removeThisDeviceConnection = device_id;
        }
    }
    if (removeThisDeviceConnection) {
        delete DEVICE_CONNECTION_POOL[removeThisDeviceConnection];
    }

    for (device_id in HD_CONNECTION_POOL) {
        if ((HD_CONNECTION_POOL[device_id]).id == socket.id) {
            removeThisDeviceConnection = device_id;
        }
    }
    if (removeThisDeviceConnection) {
        delete HD_CONNECTION_POOL[removeThisDeviceConnection];
    }
};

function addConnection(deviceIdentity, socket) {

    if (!deviceIdentity) {
        return;
    }

    var connectionInfo = getConnectionInformation(deviceIdentity);
    if (connectionInfo.type === 'hd') {
        if (!HD_CONNECTION_POOL[connectionInfo.user]) {
            HD_CONNECTION_POOL[connectionInfo.user] = socket;
        }

    } else {
        if (!DEVICE_CONNECTION_POOL[connectionInfo.deviceIdentity]) {
            DEVICE_CONNECTION_POOL[connectionInfo.deviceIdentity] = socket;
        }
    }
};



function dispacthToAllHDs(eventName, hdIdentity, seedData) {
    if (!hdIdentity) {
        return;
    }
    var hd_id;
    for (hd_id in HD_CONNECTION_POOL) {
        var hdConnection = HD_CONNECTION_POOL[hd_id];
        hdConnection.emit(eventName, hdIdentity, seedData);
    }
};


function dispacthDataToHD(eventName, deviceIdentity, data) {

    if (!deviceIdentity) {
        return;
    }

    var connectionInfo = getConnectionInformation(deviceIdentity);
    var hdConnection = getHDconnection(connectionInfo.user);
    hdConnection.emit(eventName, connectionInfo.deviceIdentity, data);

};


io.on('connection', function (socket) {

    log('connection');

    socket.on('identify', function (identity) {
        console.log('identify: ' + identity);
        addConnection(identity, socket);
    });


    socket.on('disconnect', function () {
        console.log('disconnect: ' + socket.id);
        removeConnection(socket);
    });

    socket.on('seed_broadcast', function (identity, data) {
        log('seed_broadcast');
        dispacthToAllHDs('seed_broadcast', identity, data);
        log('seed_broadcast dispatched');
    });

    socket.on('seed_broadcast_reply', function (identity, data) {
        log('hd_seed_to: ' + identity);
        try {
            dispacthDataToHD('seed_broadcast_reply', identity, data);
        } catch (e) {
            log('Error while dispatching HD data: ' + e);
        }
        log('hd_seed_to dispatched');
    });


    socket.on('data', function (deviceIdentity, data) {

        log('data');

        try {
            addConnection(deviceIdentity, socket);
            dispacthDataToHD('data', deviceIdentity, data);
        } catch (e) {
            log('Error while dispatching HD data: ' + e);
        }
    });

});