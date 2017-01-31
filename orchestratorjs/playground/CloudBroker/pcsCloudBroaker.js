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
        pcsConnection: < socket >
    }
}*/
var PCS_CONNECTION_POOL = {};
var DEVICE_CONNECTION_POOL = {};


function getConnectionInformation(deviceIdentity) {
    var parts = deviceIdentity.split('@', 2);
    if (deviceIdentity.indexOf('@') === -1) {
        throw ("Malformed device identity");
    }

    var type = 'device';
    if (parts[1].toLowerCase() === 'pcs') {
        type = 'pcs';
    }

    return {
        user: parts[0],
        deviceIdentity: deviceIdentity,
        type: type
    };
}

function getPCSconnection(username) {

    var pcsConnectionSocket = PCS_CONNECTION_POOL[username];
    if (!pcsConnectionSocket) {
        throw 'No PCS Connection'
    }
    return pcsConnectionSocket;
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

    for (device_id in PCS_CONNECTION_POOL) {
        if ((PCS_CONNECTION_POOL[device_id]).id == socket.id) {
            removeThisDeviceConnection = device_id;
        }
    }
    if (removeThisDeviceConnection) {
        delete PCS_CONNECTION_POOL[removeThisDeviceConnection];
    }
};

function addConnection(deviceIdentity, socket) {

    if (!deviceIdentity) {
        return;
    }

    var connectionInfo = getConnectionInformation(deviceIdentity);
    if (connectionInfo.type === 'pcs') {
        if (!PCS_CONNECTION_POOL[connectionInfo.user]) {
            PCS_CONNECTION_POOL[connectionInfo.user] = socket;
        }

    } else {
        if (!DEVICE_CONNECTION_POOL[connectionInfo.deviceIdentity]) {
            DEVICE_CONNECTION_POOL[connectionInfo.deviceIdentity] = socket;
        }
    }
};



function dispacthToAllPCSs(eventName, pcsIdentity, seedData) {
    if (!pcsIdentity) {
        return;
    }
    var pcs_id;
    for (pcs_id in PCS_CONNECTION_POOL) {
        var pcsConnection = PCS_CONNECTION_POOL[pcs_id];
        pcsConnection.emit(eventName, pcsIdentity, seedData);
    }
};


function dispacthDataToPCS(eventName, deviceIdentity, data) {

    if (!deviceIdentity) {
        return;
    }

    var connectionInfo = getConnectionInformation(deviceIdentity);
    var pcsConnection = getPCSconnection(connectionInfo.user);
    pcsConnection.emit(eventName, connectionInfo.deviceIdentity, data);

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
        dispacthToAllPCSs('seed_broadcast', identity, data);
        log('seed_broadcast dispatched');
    });

    socket.on('seed_broadcast_reply', function (identity, data) {
        log('pcs_seed_to: ' + identity);
        try {
            dispacthDataToPCS('seed_broadcast_reply', identity, data);
        } catch (e) {
            log('Error while dispatching PCS data: ' + e);
        }
        log('pcs_seed_to dispatched');
    });


    socket.on('data', function (deviceIdentity, data) {

        log('data');

        try {
            addConnection(deviceIdentity, socket);
            dispacthDataToPCS('data', deviceIdentity, data);
        } catch (e) {
            log('Error while dispatching PCS data: ' + e);
        }
    });

});