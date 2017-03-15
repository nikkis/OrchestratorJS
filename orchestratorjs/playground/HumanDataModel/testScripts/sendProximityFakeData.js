var hostname = 'localhost';
var port = 9006;

var socketIO = require('socket.io-client').connect('http://' + hostname + ':' + port);


var Fiber = require('fibers');

function sleep(seconds) {
    var fiber = Fiber.current;
    setTimeout(function () {
        fiber.run();
    }, seconds * 1000);
    Fiber.yield();
}

var interval = 3;
var deviceIdentity = 'alice@raspberry';

var values = [];
values.push({
    "ble_devices": [
    ["717f860e-f0e6-4c93-a4e3-cc724d27e05e", -90],
    ["5bf2e050-4730-46de-b6a7-2c8be4d9fa36", -59],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c84f", -59]
  ]
});


values.push({
    "ble_devices": [
    ["717f860e-f0e6-4c93-a4e3-cc724d27e05e", -90],
    ["5bf2e050-4730-46de-b6a7-2c8be4d9fa36", -90],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c84f", -83]
  ]
});


values.push({
    "ble_devices": [
    ["717f860e-f0e6-4c93-a4e3-cc724d27e05e", -90],
    ["5bf2e050-4730-46de-b6a7-2c8be4d9fa36", -90],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c84f", -59],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c8dd", -59]
  ]
});



values.push({
    "ble_devices": [
    ["717f860e-f0e6-4c93-a4e3-cc724d27e05e", -90],
    ["5bf2e050-4730-46de-b6a7-2c8be4d9fa36", -90],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c84f", -59],
    ["8b034f7b-fa9b-540f-acf3-88c0ca70c8dd", -59]
  ]
});



Fiber(function () {

    //sleep(5);

    for (i in values) {

        console.log(values[i]);

        socketIO.emit("pcs_data", deviceIdentity, values[i]);

        sleep(interval);
    }

}).run();