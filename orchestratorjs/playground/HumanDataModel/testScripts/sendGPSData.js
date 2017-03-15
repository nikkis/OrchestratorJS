var hostname = 'localhost';
var port = 9006;

var socketIO = require('socket.io-client').connect('http://' + hostname + ':' + port);



// GPS DATA

var deviceIdentity = 'alice@iphone';
var data = {
    "gps_coordinates": [61.45010307017452, 23.85556729123141]
};
console.log('Sending event: ' + Object.keys(data)[0]);
console.log(data);
socketIO.emit("pcs_data", deviceIdentity, data);