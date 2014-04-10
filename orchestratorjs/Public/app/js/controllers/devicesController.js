var app = angular.module( 'ojsConsole.controllers.DevicesController', [ 'ojsConsole.services', 'ojsConsole.services.SocketIOService' ] );


function blinkCell( deviceIdentity, metadataKey ) {
	var className = '.'+deviceIdentity.replace('@','AT')+'_'+metadataKey;

	//console.log(className);

	$(className).addClass('blinkClass');
	$(className).bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function (e) {
	  $(className).removeClass('blinkClass');
	});
}


app.controller( 'DevicesController',
	function( $scope, socket ) {

		// listen changes in metadata and update view accordingly
		socket.on('ojs_context_data', function ( message ) {
			for ( i in $scope.devices ) {
				if ( $scope.devices[ i ].identity == message.deviceIdentity ) {
					if( message.key == 'online' ) {
						$scope.devices[ i ].online = message.value;
						if( message.value )
							blinkCell( message.deviceIdentity, message.key );
					 } else {
						$scope.devices[ i ].metadata[ message.key ] = message.value;
						blinkCell( message.deviceIdentity, message.key );
					}

				}
			}
		});




/*
$scope.testClick = function() {
	console.log('adding blink!!');
	blinkCell('nikkis@s3mini','online');
};
*/

		socket.on('ojs_log_', function ( deviceIdentity, message ) {
			console.log( deviceIdentity+': ' + message );
		});

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		$.getJSON( '/api/' + apiVersion + '/devices', function( data ) {
			
			
			$scope.capabilities = data.capabilities;
			var nonSpecialMetadata = [];
			for( i in data.metadataFields ) {
				if( data.metadataFields[ i ] == 'proximityDevices' ) {

				} else {
					nonSpecialMetadata.push( data.metadataFields[ i ] );
				}
			}

			$scope.metadataFields = nonSpecialMetadata;
			$scope.devices = data.devices;
			$scope.$apply();


		} );

	}
);





function hexColor( str ) {
  function intToARGB( i ) {
    return ( ( i >> 24 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 16 ) & 0xFF ).toString( 16 ) +
      ( ( i >> 8 ) & 0xFF ).toString( 16 ) +
      ( i & 0xFF ).toString( 16 );
  }

  var hash = 0;
  for ( var i = 0; i < str.length; i++ ) {
    hash = str.charCodeAt( i ) + ( ( hash << 5 ) - hash );
  }
  var r = intToARGB( hash ).slice( 2 );

  while ( r.length < 6 )
    r = r + '0';
  return r;
}




app.controller( 'UserDeviceProximityController',
	function( $scope, $location, $routeParams, $http, UserService, socket ) {

		var username = $routeParams.username;
		var deviceName = $routeParams.deviceName;
		var identity = username+'@'+deviceName;

		$scope.UserService = UserService;

		$( '.non-angular-container' ).html( '' );
		$( '.angular-container' ).show();


		var uri = '/api/1/user/'+username+'/device/'+deviceName+'/proximity';


		var width = 960,
		    height = 500;


		var force = d3.layout.force()
		    .charge(-120)
		    .linkDistance(30)
		    .size([width, height]);

		$('userDeviceProximityGraph').html('');

		var svg = d3.select(".userDeviceProximityGraph").append("svg")
		    .attr("width", width)
		    .attr("height", height);



		var graph = {};
		d3.json( uri, function(error, data) {

			graph = data;

			// initialize with fetched data
			force.nodes(graph.nodes).links(graph.links).linkDistance(function(d) {
					var dd = ( d.value * 90 ) * 5;
			  	return dd;
			} );

				

			function updateGraph() {

			  var link = svg.selectAll(".link")
			      .data(graph.links)
			    .enter().append("line")
			      .attr("class", function(d) { return "link " + d.devName.replace('@','AT') } )
			      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

			  var node = svg.selectAll(".node")
			      .data(graph.nodes)
			    .enter().append("circle")
			      .attr("class", function(d) { return "node " + d.name.replace('@','AT') } )
			      .attr("r", function(d) { return d.size } )
			      .style("fill", function(d) { return hexColor(d.name); })
			      .call(force.drag);

			  node.append("title")
			      .text(function(d) { return d.name; });


				var label = svg.selectAll("text")
						.data(graph.nodes)
						.enter().append("text")
						.attr("class", function(d) { return "label " + d.name.replace('@','AT') } )
				    .attr( { "x" : function(d){ return d.x; } ,
						         "y" : function(d){ return d.y; } } )
				    .text(function(d) { return d.name; } )
				    .call( force.drag );


				force.start();

			}


			  force.on("tick", function() {

					var link = svg.selectAll(".link");
			    link.attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

					var node = svg.selectAll(".node");
			    node.attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });


					var label = svg.selectAll("text");
			    label.attr("x", function(d) { return d.x - 33; })
			    		 .attr("y", function(d) { return d.y + 20; }); 

			  });


			updateGraph();


		// listen changes in proximityDevice and update graph accordingly
		socket.on('ojs_context_data', function ( message ) {
			
			if( message.key == 'proximityDevices' ) {

				var currentDeviceIds = [];
				for( j in message.value ) {
					var pDevId = message.value[ j ][ 0 ];
					var pDevDistance = message.value[ j ][ 1 ];
					currentDeviceIds.push( pDevId );

					// check if the node already exists
					var devIndex = -1;
					for( i in graph.nodes ) {
						if( graph.nodes[ i ].name == pDevId ) {
							console.log('oli: '+pDevId);
							devIndex = i;
						}
					}
					
					if( devIndex == -1 ) {
						devIndex = graph.nodes.push( { "className": pDevId.replace('@','AT'), "name": pDevId, "group": 1, "size": 7 } ) - 1;
					}

					// check if we already have the link between 0 and the device
					var linkIdex = -1;
					
					for( i in graph.links ) {
						if( graph.links[ i ].devName == pDevId ) {
							linkIdex = i;
						}
					}

					if( linkIdex == -1 ) {
						linkIdex = graph.links.push( { "devName": pDevId, "source": devIndex, "target": 0, "value": pDevDistance } ) - 1;
					}
					graph.links[ linkIdex ].value = pDevDistance;
				}

				// use the same method for adding and initializing the nodes and links
				updateGraph();


				// remove devices that were not in the new proximity set!
				for (var i = graph.links.length - 1; i >= 0; i--) {

					var prevDevId = graph.links[ i ].source.name;
					if( prevDevId && currentDeviceIds.indexOf( prevDevId ) == -1 ) {
						//console.log( 'remove this: '+prevDevId +', node devName: '+graph.links[ i ].devName );

						// remove from the image
						svg.selectAll("." + prevDevId.replace('@','AT') ).data( graph.links[i] ).exit().remove();

						// remove from the data models
						for( k in graph.nodes ) {
							console.log( "node.name: " + graph.nodes[ k ].name );
							if( graph.nodes[ k ].name == prevDevId ) {
								graph.nodes.splice( k, 1 );
							}
						}

						for( k in graph.links ) {
							console.log( "link.devName: " + graph.links[ k ].devName );
							if( graph.links[ k ].devName == prevDevId ) {
								graph.links.splice( k, 1 );
							}
						}

					}
				};

			}




		} );




		} );





	}
);








