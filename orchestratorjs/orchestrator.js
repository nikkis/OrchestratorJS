/*jslint node: true */
"use strict";

var ROOT = process.cwd();
var HELPERS = require(ROOT + '/helpers/general.js');
var log = HELPERS.log;



var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;




var config = require(ROOT + '/config.json');
log("HOSTNAME: " + config.server.host);
log("    PORT: " + config.server.port);


var mu2express = require("mu2express");

var express = require('express');
var app = express();
app.use(express.bodyParser());

var socket = require('socket.io');
app.configure(function () {
  app.use(express.static(ROOT + '/'));
});



app.use(express.cookieParser());
app.use(express.session({
  secret: 'ojsbottomsecret'
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(ROOT + '/Public'));
//app.engine( 'mustache', mu2express.engine );
//app.set( 'view engine', 'mustache' );

app.set('view engine', 'ejs');
app.set('view options', {
  layout: false
});


app.set('views', __dirname + '/Views');




////////// INITIALIZE SERVICES - START //////////
var services = require(ROOT + '/Services/services.js')
services.initializeServices();
////////// INITIALIZE SERVICES - END   //////////



////////// INITIALIZE ORCHESTRATOR CORE - START //////////
var orchestrator = require(ROOT + '/Controllers/orchestratorCore.js');
orchestrator.initialize(app);
////////// INITIALIZE ORCHESTRATOR CORE -   END //////////



////////// MAIN CONSOLE HTML - START //////////
var webconsole = require(ROOT + '/Controllers/console.js');
app.get('/', function (req, res) {
  webconsole.showIndexView(req, res)
});
app.get('/console', function (req, res) {
  webconsole.showIndexView(req, res)
});

app.get('/api/' + config.api + '/action', function (req, res) {
  webconsole.getActions(req, res)
});
app.get('/api/' + config.api + '/action/:actionName', function (req, res) {
  webconsole.getAction(req, res)
});
app.get('/api/' + config.api + '/action/:actionName/metadata', function (req, res) {
  webconsole.getActionMetadata(req, res)
});

app.get('/api/' + config.api + '/capability', function (req, res) {
  webconsole.getCapabilities(req, res)
});
app.get('/api/' + config.api + '/capability/:capabilityName', function (req, res) {
  webconsole.getCapability(req, res)
});

app.get('/api/' + config.api + '/virtualCapability', function (req, res) {
  webconsole.getVirtualCapabilities(req, res)
});
app.get('/api/' + config.api + '/virtualCapability/:capabilityName', function (req, res) {
  webconsole.getVirtualCapability(req, res)
});


app.get('/api/' + config.api + '/downloads', function (req, res) {
  webconsole.getDownloads(req, res)
});
app.get('/api/' + config.api + '/downloads/:clientName', function (req, res) {
  webconsole.getDownload(req, res)
});


app.get('/test', function (req, res) {
  webconsole.test(req, res)
});


//////////  MAIN CONSOLE HTML - END  //////////


////////// Users Controller - START //////////



var userController = require(ROOT + '/Controllers/users.js');
userController.initialize(orchestrator);

app.get('/api/' + config.api + '/user/:username', function (req, res) {
  userController.getUser(req, res)
});

// log in and out
app.post('/api/' + config.api + '/login', function (req, res) {
  userController.login(req, res)
});
app.post('/api/' + config.api + '/logout', function (req, res) {
  userController.logout(req, res)
});

// post is for registering, put is for editing
app.post('/api/' + config.api + '/user', function (req, res) {
  userController.postUser(req, res)
});
// put is for editing, post is for registering
app.put('/api/' + config.api + '/user/:username', function (req, res) {
  userController.putUser(req, res)
});
app.delete('/api/' + config.api + '/user/:username', function (req, res) {
  userController.deleteUser(req, res)
});


app.get('/api/' + config.api + '/user/:username/device/:deviceName/proximity', function (req, res) {
  userController.getProximityGraph(req, res)
});


app.get('/api/' + config.api + '/user/:username/device/:deviceName', function (req, res) {
  userController.getDevice(req, res)
});
app.post('/api/' + config.api + '/user/:username/device/:deviceName', function (req, res) {
  userController.postDevice(req, res)
});
app.delete('/api/' + config.api + '/user/:username/device/:deviceName', function (req, res) {
  userController.deleteDevice(req, res)
});


////////// Users Controller - END   //////////



////////// Resource Handler - START //////////
var resourceHandler = require(ROOT + '/resources/handler.js');

app.post('/api/' + config.api + '/user/:username/action/:actionName', function (req, res) {
  resourceHandler.postAction(req, res)
});
app.delete('/api/' + config.api + '/user/:username/action/:actionName', function (req, res) {
  resourceHandler.deleteAction(req, res)
});

app.post('/api/' + config.api + '/device', function (req, res) {
  resourceHandler.postDevice(req, res)
});

//app.post('/api/'+config.api+'/capability/:capabilityName', function(req, res) { resourceHandler.postCapability(req, res) });
app.post('/api/' + config.api + '/user/:username/capability/:capabilityName', function (req, res) {
  resourceHandler.postCapability(req, res)
});
app.delete('/api/' + config.api + '/user/:username/capability/:capabilityName', function (req, res) {
  resourceHandler.deleteCapability(req, res)
});

app.get('/api/' + config.api + '/capabilities/info', function (req, res) {
  resourceHandler.getCapabilityInfo(req, res)
});

app.post('/api/' + config.api + '/user/:username/virtualCapability/:capabilityName', function (req, res) {
  resourceHandler.postVirtualCapability(req, res)
});
app.delete('/api/' + config.api + '/user/:username/virtualCapability/:capabilityName', function (req, res) {
  resourceHandler.deleteVirtualCapability(req, res)
});


////////// Resource Handler - END   //////////







////////// Orchestrator - START //////////

app.delete('/api/' + config.api + '/actioninstance/:actioninstanceID', function (req, res) {
  orchestrator.deleteActionInstance(req, res)
});
app.post('/api/' + config.api + '/actioninstance', function (req, res) {
  orchestrator.postActionInstance(req, res)
});

app.get('/api/' + config.api + '/actioninstances', function (req, res) {
  orchestrator.getActionInstances(req, res)
});
app.get('/api/' + config.api + '/devices', function (req, res) {
  orchestrator.getDevices(req, res)
});

////////// Orchestrator - END   //////////




////////// Apps - START //////////
var appController = require(ROOT + '/Controllers/apps.js');

app.get('/api/' + config.api + '/apps', function (req, res) {
  appController.getApps(req, res)
});



app.get('/api/' + config.api + '/user/:username/app/:appName', function (req, res) {
  appController.getAppFile(req, res)
});

app.delete('/api/' + config.api + '/user/:username/app/:appName', function (req, res) {
  appController.deleteAppFile(req, res)
});
//app.post('/api/'+config.api+'/app/:appName', function(req, res) { appController.postAppFile(req, res) });
app.post('/api/' + config.api + '/user/:username/app/:appName', function (req, res) {
  appController.postAppFile(req, res)
});

app.post('/api/' + config.api + '/user/:username/app/:appName/instance', function (req, res) {
  appController.postAppInstance(req, res)
});
app.delete('/api/' + config.api + '/user/:username/app/:appName/instance', function (req, res) {
  appController.deleteAppInstance(req, res)
});

// save app settings for a user
app.post('/api/' + config.api + '/user/:username/app/:appName/settings', function (req, res) {
  appController.postAppSettings(req, res)
});
app.get('/api/' + config.api + '/user/:username/app/:appName/settings', function (req, res) {
  appController.getAppSettings(req, res)
});


app.post('/api/' + config.api + '/user/:username/app/:appName/info', function (req, res) {
  appController.postAppInfo(req, res)
});
app.get('/api/' + config.api + '/user/:username/app/:appName/info', function (req, res) {
  appController.getAppInfo(req, res)
});



////////// Apps - END   //////////



// Send error messages
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.send(500, err + '\n');
});