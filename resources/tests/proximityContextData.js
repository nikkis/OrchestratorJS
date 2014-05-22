//var hostname = 'localhost';
var hostname = 'orchestratorjs.org';

var pubsub = require( 'socket.io-client' ).connect( 'http://'+hostname+':9000' );
var Fiber = require( 'fibers' );

function sleep( seconds ) {
  var fiber = Fiber.current;
  setTimeout( function() {
    fiber.run();
  }, seconds * 1000 );
  Fiber.yield();
}

var interval = 3;
var deviceIdentity = 'nikkis@s3mini';

var values = [];
values.push( {
  "bt_devices": [
    [ "60:45:BD:D3:8C:63", -90 ],
    [ "E8:99:C4:D6:77:06", -59 ],
    [ "00:25:56:D0:04:DB", -83 ],
    [ "D0:E7:82:08:66:06", -41 ],
    [ "08:ED:B9:BA:00:F2", -89 ]
  ]
} );


values.push( {
  "bt_devices": [
    [ "60:45:BD:D3:8C:63", -90 ],
    [ "00:25:56:D0:04:DB", -83 ],
    [ "D0:E7:82:08:66:06", -41 ],
    [ "08:ED:B9:BA:00:F2", -89 ]
  ]
} );


values.push( {
  "bt_devices": [
    [ "60:45:BD:D3:8C:63", -90 ],
    [ "E8:99:C4:D6:77:06", -59 ],
    [ "00:25:56:D0:04:DB", -83 ],
    [ "D0:E7:82:08:66:06", -41 ],
    [ "08:ED:B9:BA:00:F2", -89 ]
  ]
} );



Fiber( function() {

  sleep( 5 );

  for ( i in values ) {

    console.log( 'tick' );
    console.log( values[ i ] );

    pubsub.emit( "ojs_context_data", "", deviceIdentity, values[ i ] );

    sleep( interval );
  }

} ).run();