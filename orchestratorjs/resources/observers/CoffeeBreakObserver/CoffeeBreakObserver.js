
var Fiber = require('fibers');
var tools = require('../../tools.js');


Fiber(function() {

  while(true) {
    
    console.log('coffeeBreakObserver - tick');
    
    tools.sleep(10);


  }

}).run();
