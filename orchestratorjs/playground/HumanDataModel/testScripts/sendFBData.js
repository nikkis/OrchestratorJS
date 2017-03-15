var hostname = 'localhost';
var port = 9006;

var log = console.log;

var socketIO = require('socket.io-client').connect('http://' + hostname + ':' + port);
/*
data = ({
    id = 120144918465781;
    name = "Charlie Aladajhbjdgfb Zuckersen";
}, {
    id = 119560198524790;
    name = "Ruth Aladabdcadjcj Bharambesky";
}, {
    id = 117525188729419;
    name = "Teemu Teekkari";
});*/


// FB DATA

var deviceIdentity = 'alice@iphone';
var event = {
    "facebook_friends": ['niko', 'hermanni']
};
console.log('Sending event: ' + Object.keys(event)[0]);
console.log(event);
socketIO.emit("pcs_data", deviceIdentity, event);


// FB DATA

var deviceIdentity = 'alice@iphone';
var event = {
    "facebook_friends": ['niko', 'teppo']
};
console.log('Sending event: ' + Object.keys(event)[0]);
console.log(event);
socketIO.emit("pcs_data", deviceIdentity, event);