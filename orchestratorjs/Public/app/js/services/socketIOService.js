var app = angular.module( 'ojsConsole.services.SocketIOService', [] );


var ojsDeviceRegistryServicePort = 9001;

app.factory( 'socket', function( $rootScope ) {
	var socket = io.connect( 'http://'+hostName+':'+pubsubPort );
	return {
		on: function( eventName, callback ) {
			socket.on( eventName, function() {			
				var args = arguments;
				$rootScope.$apply( function() {
					callback.apply( socket, args );
				} );
			} );
		},
		emit: function( eventName, data, callback ) {
			socket.emit( eventName, data, function() {
				var args = arguments;
				$rootScope.$apply( function() {
					if ( callback ) {
						callback.apply( socket, args );
					}
				} );
			} );
		}
	};

} );