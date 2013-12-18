ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require(ROOT+'/config.json');
log("HOSTNAME: "+config.server.host);
log("    PORT: "+config.server.port);


var mu2express = require("mu2express");

var express = require('express');
var app = express();
app.use(express.bodyParser());

var socket = require('socket.io');
app.configure(function(){
  app.use(express.static(ROOT+'/'));
});

app.use(express.static(ROOT+'/Public'));
app.engine('mustache', mu2express.engine);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/Views');





////////// MAIN CONSOLE HTML - START //////////
var webconsole = require(ROOT+'/Controllers/console.js');
app.get('/', function(req, res) { webconsole.showIndexView(req, res) });

app.get('/api/'+config.api+'/action', function(req, res) { webconsole.getActions(req, res) });
app.get('/api/'+config.api+'/action/:actionName', function(req, res) { webconsole.getAction(req, res) });
app.get('/api/'+config.api+'/action/:actionName/metadata', function(req, res) { webconsole.getActionMetadata(req, res) });

app.get('/api/'+config.api+'/capability', function(req, res) { webconsole.getCapabilities(req, res) });
app.get('/api/'+config.api+'/capability/:capabilityName', function(req, res) { webconsole.getCapability(req, res) });

app.get('/api/'+config.api+'/downloads', function(req, res) { webconsole.getDownloads(req, res) });
app.get('/api/'+config.api+'/downloads/:clientName', function(req, res) { webconsole.getDownload(req, res) });


app.get('/test', function(req, res) { webconsole.test(req, res) });


//////////  MAIN CONSOLE HTML - END  //////////






////////// Resource Handler - START //////////
var resourceHandler = require(ROOT+'/resources/handler.js');

app.post('/api/'+config.api+'/action/:actionName', function(req, res) { resourceHandler.postAction(req, res) });
app.delete('/api/'+config.api+'/action/:actionName', function(req, res) { resourceHandler.deleteAction(req, res) });

app.post('/api/'+config.api+'/device', function(req, res) { resourceHandler.postDevice(req, res) });

app.post('/api/'+config.api+'/capability/:capabilityName', function(req, res) { resourceHandler.postCapability(req, res) });
app.delete('/api/'+config.api+'/capability/:capabilityName', function(req, res) { resourceHandler.deleteCapability(req, res) });

////////// Resource Handler - END   //////////







////////// Orchestrator - START //////////
var orchestrator = require(ROOT+'/Controllers/coordinator.js');
orchestrator.initialize(app);

app.delete('/api/'+config.api+'/actioninstance/:actioninstanceID', function(req, res) { orchestrator.deleteActionInstance(req, res) });
app.post('/api/'+config.api+'/actioninstance', function(req, res) { orchestrator.postActionInstance(req, res) });

app.get('/api/'+config.api+'/actioninstances', function(req, res) { orchestrator.getActionInstances(req, res) });
app.get('/api/'+config.api+'/devices', function(req, res) { orchestrator.getDevices(req, res) });

////////// Orchestrator - END   //////////




// Send error messages
app.use(function(err, req, res, next) {
  	console.error(err.stack);
  	res.send(500, err+'\n');
});




	



