var Fiber = require( 'fibers' );

this.sleep = function( seconds ) {
	var fiber = Fiber.current;
	setTimeout( function() {
		fiber.run();
	}, seconds * 1000 );
	Fiber.yield();
}