function hexColor(str) {
    function intToARGB(i) {
        return ((i >> 24) & 0xFF).toString(16) +
            ((i >> 16) & 0xFF).toString(16) +
            ((i >> 8) & 0xFF).toString(16) +
            (i & 0xFF).toString(16);
    }

    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var r = intToARGB(hash).slice(2);

    while (r.length < 6)
        r = r + '0';
    return r;
}




function updateProximityGraph(username, deviceName, proxemicItems) {

    var identity = username + '@' + deviceName;

    var nodes = [],
        links = [],
        i,
        pDevId,
        pDevDistance;

    nodes.push({
        "className": identity.replace('@', 'AT'),
        "name": identity,
        "group": 1,
        "size": 10
    });

    var device = {
        proximityDevices: [
            'alice@iphone5',
            'alice@beacon'
        ]
    };

    for (i in proxemicItems) {
        pDevId = proxemicItems[i];
        pDevDistance = 1.0;

        nodes.push({
            "className": pDevId.replace('@', 'AT'),
            "name": pDevId,
            "group": i + 1,
            "size": 7
        });
        links.push({
            "devName": pDevId,
            "source": parseInt(i, 0) + 1,
            "target": 0,
            "value": pDevDistance
        });
    }

    var jsonGraph = {};
    jsonGraph.nodes = nodes;
    jsonGraph.links = links;

    dooStuff(username, deviceName, jsonGraph);
}

function dooStuff(username, deviceName, graph) {

    var identity = username + '@' + deviceName;


    $('.non-angular-container').html('');
    $('.angular-container').show();


    var uri = '/api/1/user/' + username + '/device/' + deviceName + '/proximity';


    var width = window.innerWidth,
        height = window.innerHeight;


    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

    $('.userDeviceProximityGraph').html('');

    var svg = d3.select(".userDeviceProximityGraph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //svg.style("background-color", 'blue').style("opacity", '0.3');
    svg.style("background-color", 'transparent');


    /////////////////////////
    ////    All Begins Here
    /////////////////////////


    // initialize with fetched data
    force.nodes(graph.nodes).links(graph.links).linkDistance(function (d) {

        if (d.value < 0)
            return undefined;

        else if (d.value == 0.1)
            return 60;

        else if (d.value == 1.0)
            return 120;

        else if (d.value == 10.0)
            return 200;

        else
            return undefined;

    });


    var regions = [
        {
            "radius": 50,
            "color": "blue"
        },
        {
            "radius": 100,
            "color": "green"
        },
        {
            "radius": 200,
            "color": "grey"
        }
			];

    function drawCircle(x, y, className, options) {
        var circleData = [{
            "cx": x,
            "cy": y,
            "radius": options.radius,
            "color": options.color
        }];
        var circle = svg.selectAll(".region")
            .data(circleData)
            .enter().append("circle")
            .attr("cx", function (d) {
                return d.cx;
            })
            .attr("cy", function (d) {
                return d.cy;
            })
            .attr("class", function (d) {
                return "circle " + className;
            })
            .attr("r", function (d) {
                return d.radius;
            })
            .style("fill-opacity", function (d) {
                return 0.1;
            })
            .style("fill", function (d) {
                return d.color;
            })
            .style("stroke", function (d) {
                return d.color;
            });
    }



    // Add regions
    for (var ii in graph.nodes) {
        console.log(graph.nodes[ii].name);
        //drawCircle(graph.nodes[ii].cx, graph.nodes[ii].cy, graph.nodes[ii].name);
        drawRegions(graph.nodes[ii]);
    }



    function updateCircle(x, y, className) {
        var circle = svg.selectAll("." + className);
        circle.attr("cx", function (d) {
                return x;
            })
            .attr("cy", function (d) {
                return y;
            });
    }


    function drawRegions(entity) {
        drawCircle(entity.cx, entity.cy, "region0_" + entity.name.replace('@', 'AT'), regions[0]);
        drawCircle(entity.cx, entity.cy, "region1_" + entity.name.replace('@', 'AT'), regions[1]);
    }

    function updateRegions(entity) {
        updateCircle(entity.x, entity.y, "region0_" + entity.name.replace('@', 'AT'));
        updateCircle(entity.x, entity.y, "region1_" + entity.name.replace('@', 'AT'));
    }

    function removeRegions(entity) {
        updateCircle(entity.x, entity.y, "region0_" + entity.name.replace('@', 'AT'));
        updateCircle(entity.x, entity.y, "region1_" + entity.name.replace('@', 'AT'));
    }

    function updateGraph() {

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", function (d) {
                return "link " + d.devName.replace('@', 'AT')
            })
            .style("stroke-width", function (d) {
                return Math.sqrt(d.value);
            });

        /*				
        				// Add regions
        				for(var ii in graph.nodes) {
        					console.log(graph.nodes[ii].name);
        					//drawCircle(graph.nodes[ii].cx, graph.nodes[ii].cy, graph.nodes[ii].name);
        					drawRegions(graph.nodes[ii]);
        				}
        */

        /// orig
        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", function (d) {
                return "node " + d.name.replace('@', 'AT')
            })
            .attr("r", function (d) {
                return d.size
            })
            .style("fill", function (d) {
                return hexColor(d.name);
            })
            .call(force.drag);




        node.append("title")
            .text(function (d) {
                return d.name;
            });


        var label = svg.selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", function (d) {
                return "label " + d.name.replace('@', 'AT')
            })
            .attr({
                "x": function (d) {
                    return d.x;
                },
                "y": function (d) {
                    return d.y;
                }
            })
            .text(function (d) {
                return d.name;
            })

        // Does not work yet
        //.attr('transform', 'translate(-' + height + ',' + height / 2 + ') rotate(-90)')	
        .call(force.drag);


        force.start();

    }


    force.on("tick", function () {

        var link = svg.selectAll(".link");
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        var node = svg.selectAll(".node");
        node.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                //updateCircle(d.x,d.y,d.name);
                updateRegions(d);
                return d.y;
            });

        var label = svg.selectAll("text");
        label.attr("x", function (d) {
                return d.x - 33;
            })
            .attr("y", function (d) {
                return d.y + 20;
            });

    });


    updateGraph();


    // listen changes in proximityDevice and update graph accordingly

    function update(event) {



        if (event.eventType == 'proximityDevices') {

            var currentDeviceIds = [];
            for (j in event.eventValue) {
                var pDevId = event.eventValue[j][0];
                var pDevDistance = event.eventValue[j][1];
                currentDeviceIds.push(pDevId);

                // check if the node already exists
                var devIndex = -1;
                for (i in graph.nodes) {
                    if (graph.nodes[i].name == pDevId) {
                        console.log('oli: ' + pDevId);
                        devIndex = i;
                    }
                }

                if (devIndex == -1) {
                    devIndex = graph.nodes.push({
                        "className": pDevId.replace('@', 'AT'),
                        "name": pDevId,
                        "group": 1,
                        "size": 7
                    }) - 1;

                    drawRegions(graph.nodes[devIndex]);

                }

                // check if we already have the link between 0 and the device
                var linkIdex = -1;

                for (i in graph.links) {
                    if (graph.links[i].devName == pDevId) {
                        linkIdex = i;
                    }
                }

                if (linkIdex == -1) {
                    linkIdex = graph.links.push({
                        "devName": pDevId,
                        "source": devIndex,
                        "target": 0,
                        "value": pDevDistance
                    }) - 1;
                }
                graph.links[linkIdex].value = pDevDistance;
            }

            // use the same method for adding and initializing the nodes and links
            updateGraph();


            // remove devices that were not in the new proximity set!
            for (var i = graph.links.length - 1; i >= 0; i--) {

                var prevDevId = graph.links[i].source.name;
                if (prevDevId && currentDeviceIds.indexOf(prevDevId) == -1) {
                    //console.log( 'remove this: '+prevDevId +', node devName: '+graph.links[ i ].devName );

                    // remove from the image
                    svg.selectAll("." + prevDevId.replace('@', 'AT')).data(graph.links[i]).exit().remove();

                    svg.selectAll(".region0_" + prevDevId.replace('@', 'AT')).data(graph.links[i]).exit().remove();
                    svg.selectAll(".region1_" + prevDevId.replace('@', 'AT')).data(graph.links[i]).exit().remove();

                    // remove from the data models
                    for (k in graph.nodes) {
                        console.log("node.name: " + graph.nodes[k].name);
                        if (graph.nodes[k].name == prevDevId) {
                            graph.nodes.splice(k, 1);
                        }
                    }

                    for (k in graph.links) {
                        console.log("link.devName: " + graph.links[k].devName);
                        if (graph.links[k].devName == prevDevId) {
                            graph.links.splice(k, 1);
                        }
                    }

                }
            };

        }

    }


}