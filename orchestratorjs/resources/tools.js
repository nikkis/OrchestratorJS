ROOT = process.cwd();
HELPERS = require(ROOT + '/helpers/general.js');
log = HELPERS.log

var config = require(ROOT + '/config.json');


var Fiber = require('fibers');

this.sleep = function (seconds) {
  var fiber = Fiber.current;
  setTimeout(function () {
    fiber.run();
  }, seconds * 1000);
  Fiber.yield();
}

this.getUser = function () {
  return 'nikkis@gadgeteer';
};

this.pubsub = function () {
  return require('socket.io-client').connect('http://' + config.server.host + ':' + config.services.ojsDeviceRegistry.port);
};



this.httprequest = function (detailsDict, next) {
  var httprequest = require("request");
  return httprequest({
    uri: 'http://' + config.server.host + ':' + config.server.port + detailsDict.uri,
    method: detailsDict.method,
    form: detailsDict.form
  }, next);
};

/*
this.trigger = function (actionName, actionsParameters, next) {

  var params = {
    actionName: actionName,
    parameters: actionsParameters
  };

  this.httprequest({
    uri: '/api/1/actioninstance',
    method: "POST",
    form: params
  }, next);

};*/


this.trigger = function (actionName, actionsParameters) {

  var retVal = null;

  var params = {
    actionName: actionName,
    parameters: actionsParameters
  };

  var request = require('sync-request');

  var res = request('POST', 'http://localhost:9000/api/1/actioninstance', {
    json: params
  });

  if (res.statusCode <= 200) {

    try {
      var s = res.getBody().toString();
      retVal = (s || '').replace(/^\s+|\s+$/g, '');
    } catch (err) {
      console.log(err);
      retVal = null;
    }

  } else {
    if (res.headers && res.headers.reason) {
      retVal = res.headers.reason;
    }
  }
  return retVal;
};