var Fiber = require('fibers');
 
function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms*1000);
    Fiber.yield();
}


this.getParticipants = function () {
    return [];
};

// the body
this.body = function () {
    console.log('heijaa begin');
    sleep(3);
    console.log('heijaa end');	
};


