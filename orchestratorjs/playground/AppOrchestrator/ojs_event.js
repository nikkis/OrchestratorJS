var hostname = 'localhost';
//var hostname = 'orchestratorjs.org';

var pubsub = require('socket.io-client').connect('http://' + hostname + ':9000');
var Fiber = require('fibers');

function sleep(seconds) {
    var fiber = Fiber.current;
    setTimeout(function () {
        fiber.run();
    }, seconds * 1000);
    Fiber.yield();
}


var deviceIdentity = 'alice@iphone';
var event = {
    "currentPhotoChanged": 'http://whm19.louhi.net/~taitoata/wp-content/uploads/2015/11/kultainen_1.jpg ' + Date.now()
};
console.log('Sending event: ' + Object.keys(event)[0]);
console.log(event);

//pubsub.emit("ojs_event", "", deviceIdentity, "eventi_arvo here");
pubsub.emit("ojs_context_data", "", deviceIdentity, event);