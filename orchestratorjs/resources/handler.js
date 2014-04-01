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

var CapabilityInfoHandler = require(ROOT+'/Models/capabilityInfo');
var CAPABILITY_INFO_HANDLER = new CapabilityInfoHandler();



this.postDevice = function(req, res) {
	var identity =     req.body['identity'];
	var bluetoothMAC = req.body['bluetoothMAC'];
	var type = req.body['type'];
	var username = req.body['username'];
	var capabilities = req.body['capabilities'];

	DEVICE_HANDLER.updateOrCreateDevice(identity, bluetoothMAC, name, type, capabilities);
	res.send('OK\n');
};

/*
this.postAppFile = function( req, res ) {
	var appName = req.params.appName;
	var body = '';
	var appPath = ROOT + config.resources.apps + appName + '/';
	fs.mkdir( appPath, 0777, true, function( err ) {
		if ( err ) {
			log( 'Cannot create folder: ' + appPath );
			throw new Error( 'Error while creting folder: ' + appPath );
		}

		req.on( 'data', function( data ) {
			body += data;
		} );

		req.on( 'end', function() {
			var POST = body;
			HELPERS.saveFileNoRequire( appPath + appName + '.js', POST );
		} );
		res.send( 'OK' );
	} );

};
*/


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
    this.generateCapabilityStub;
    HELPERS.saveFile(ROOT+config.resources.capabilities+capabilityName+'.js', POST, generateCapabilityStub, capabilityName);
	});
	res.send('OK');
};

this.deleteCapability = function(req, res) {
	var capabilityName = req.params.capabilityName;
	log('deleting capability: '+capabilityName);

	// remove capability from devices
	DEVICE_HANDLER.removeCapability( capabilityName );


	HELPERS.deleteFile(ROOT+config.resources.capabilities+capabilityName+'.js');
	res.send('OK\n');
};


function generateCapabilityStub(capabilityName) {
	var MyClass = HELPERS.reRequire(ROOT+config.resources.capabilities+capabilityName+'.js');
	var lines = 'module.exports = {\n\n';
	
	var codeCompletionLines = [];
	codeCompletionLines.push( capabilityName[ 0 ].toLowerCase() + capabilityName.slice( 1 ) );

	for(methodName in MyClass) {
		var args = HELPERS.parseArgsFromString(MyClass[methodName].toString());
		var line = '    '+ methodName + ': ' + 'function('+args.toString()+') {\n';
		   line += "        var methodArguments = ['"+capabilityName+"', '"+methodName+"', ["+args.toString()+"]];\n";
		   line += '        return this.device.invoke(methodArguments);\n';
		   line += '    },\n';
		lines += line;

		codeCompletionLines.push( generateCodeCompletionLine( capabilityName, methodName, args ) );

		generateAndroidStub( capabilityName, methodName, args );
		generateGadgeteerStub( capabilityName, methodName, args );
	}
	lines += '};';
	HELPERS.saveFile(ROOT+config.resources.capability_stubs+capabilityName+'.js', lines);

	CAPABILITY_INFO_HANDLER.upsertCapabilityInfo( 'authronamehere', capabilityName, codeCompletionLines );

};


function generateCodeCompletionLine( capabilityName, methodName, args ) {
	if ( !args || args.length == 0 )
		args = '';
	else
		args = args.toString().split(',').join(', ');

	var codeCompletionLine = capabilityName[ 0 ].toLowerCase() + capabilityName.slice( 1 ) + '.' + methodName;
	if( args )
		codeCompletionLine += '( ' + args.toString() + ' );';
	else
		codeCompletionLine += '();';

	log('completion line: ' + codeCompletionLine);
	return codeCompletionLine;
}

this.getCapabilityInfo = function ( req, res ) {

	CAPABILITY_INFO_HANDLER.findAll( function( err, data ) {

		var returnObject = {};

		for( i in data ) {
			returnObject[ data[ i ].capabilityName ] = { codeCompletionLines: data[ i ].codeCompletionLines };
		}

		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.write(
			JSON.stringify( 
				returnObject
			)
		);
		res.end();


	});



};



function generateAndroidStub( capabilityName, methodName, args ) {}
function generateGadgeteerStub( capabilityName, methodName, args ) {}



