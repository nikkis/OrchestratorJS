ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log
var config = require(ROOT+'/config.json');

//var fs = require('fs');
var fs = require('node-fs');

var qs = require('querystring');
/// saves actions and capabilities

var DeviceHandler = require(ROOT+'/Models/devicesHandler');
var DEVICE_HANDLER = new DeviceHandler();


this.postDevice = function(req, res) {
	var identity =     req.body['identity'];
	var bluetoothMAC = req.body['bluetoothMAC'];
	var type = req.body['type'];
	var name = req.body['name'];
	var capabilities = req.body['capabilities'];

	DEVICE_HANDLER.updateOrCreateDevice(identity, bluetoothMAC, name, type, capabilities);
	res.send('OK\n');
};


this.postObserverFile = function( req, res ) {
	var observerName = req.params.observerName;
	var body = '';
	var observerPath = ROOT + config.resources.observers + observerName + '/';
	fs.mkdir( observerPath, 0777, true, function( err ) {
		if ( err ) {
			log( 'Cannot create folder: ' + observerPath );
			throw new Error( 'Error while creting folder: ' + observerPath );
		}

		req.on( 'data', function( data ) {
			body += data;
		} );

		req.on( 'end', function() {
			var POST = body;
			HELPERS.saveFileNoRequire( observerPath + observerName + '.js', POST );
		} );
		res.send( 'OK' );
	} );

};



this.postAction = function(req, res) {
	var actionName = req.params.actionName;
	var body = '';

	req.on('data', function (data) {
	    body += data;
	});

	req.on('end', function () {
	    var POST = body; //.trim().ltrim();
	    HELPERS.saveFile(ROOT+config.resources.actions+actionName+'.js', POST);
	});
	res.send('OK');
};



this.deleteAction = function(req, res) {
	var actionName = req.params.actionName;
	log('deleting action: '+actionName);
	HELPERS.deleteFile(ROOT+config.resources.actions+actionName+'.js');
	res.send('OK\n');
};


this.postCapability = function(req, res) {
	var capabilityName = req.params.capabilityName;
	
	var body = '';
	req.on('data', function (data) {
	    body += data;
	});

	req.on('end', function () {
	    var POST = body;
	    log('foo');
	    var mauri = this.generateCapabilityStub;
	    HELPERS.saveFile(ROOT+config.resources.capabilities+capabilityName+'.js', POST, generateCapabilityStub, capabilityName);
	});
	res.send('OK');
};

this.deleteCapability = function(req, res) {
	var capabilityName = req.params.capabilityName;
	log('deleting capability: '+capabilityName);
	HELPERS.deleteFile(ROOT+config.resources.capabilities+capabilityName+'.js');
	res.send('OK\n');
};


function generateCapabilityStub(capabilityName) {
	var MyClass = HELPERS.reRequire(ROOT+config.resources.capabilities+capabilityName+'.js');
	var lines = 'module.exports = {\n\n';
	
/*
        var methodArguments = ['TestDevice', 'test', []];
        return this.action.sendMethodCall(this.deviceId,methodArguments);
*/


	for(methodName in MyClass) {
/*
		var args = HELPERS.parseArgsFromString(MyClass[methodName].toString());
		var line = '    '+ methodName + ': ' + 'function('+args.toString()+') {\n';
		   line += "        this.socket.emit('methodcall', [this.actionId, '"+capabilityName+"', '"+methodName+"', ["+args.toString()+"]]);\n";

		   line += '        this.action.alreadyReleased = true;\n';
		   line += '        if(!this.Fiber.current) {\n';
		   line += '            return undefined;\n';
		   line += '        }\n';
		   line += '        var c = this.Fiber.yield();\n';
		   line += '        return c;\n';
		   line += '    },\n';
		lines += line;

	}
	lines += '};';
	HELPERS.saveFile(ROOT+config.resources.capability_stubs+capabilityName+'.js', lines);
*/



		var args = HELPERS.parseArgsFromString(MyClass[methodName].toString());
		var line = '    '+ methodName + ': ' + 'function('+args.toString()+') {\n';
		   line += "        var methodArguments = ['"+capabilityName+"', '"+methodName+"', ["+args.toString()+"]];\n";

		   //line += '        return this.action.sendMethodCall(this.deviceId,methodArguments);\n';
		   line += '        return this.device.invoke(methodArguments);\n';
		   line += '    },\n';
		lines += line;
	}
	lines += '};';
	HELPERS.saveFile(ROOT+config.resources.capability_stubs+capabilityName+'.js', lines);

};






