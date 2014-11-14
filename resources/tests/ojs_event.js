var hostname = 'localhost';
//var hostname = 'orchestratorjs.org';

var pubsub = require( 'socket.io-client' ).connect( 'http://'+hostname+':9000' );
var Fiber = require( 'fibers' );

function sleep( seconds ) {
  var fiber = Fiber.current;
  setTimeout( function() {
    fiber.run();
  }, seconds * 1000 );
  Fiber.yield();
}


var deviceIdentity = 'nikkis@iphone';


console.log( 'tick' );

pubsub.emit( "ojs_event", "id1415104976144", deviceIdentity, "eventi_arvo here" );
