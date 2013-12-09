ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/socialDevicesOrchestratorDB');



var deviceSchema = mongoose.Schema({
    identity: { type: String, unique: true },
    bluetoothMAC: String,
    name: String,
    type: String,
    capabilities: [],
    lastSeen: { type: Date, default: Date.now },
});


var DeviceModel = mongoose.model('DeviceModel', deviceSchema);



module.exports = function DeviceHandler()
{
    this.findDevice = function(identity, callback) {
		    DeviceModel.findOne({identity: identity}, callback);
    };

    this.updateOrCreateDevice = function(identity, bluetoothMAC, name, type, capabilities) {

    	var lastSeen = new Date();
    	var query = { identity: identity };
		
		DeviceModel.findOneAndUpdate(query, { $set: { bluetoothMAC: bluetoothMAC, name: name, type: type, capabilities: capabilities, lastSeen: lastSeen}}, {upsert: true}, function (err, dev) {
  			if(!err) {
				console.log(dev.identity);
  			} else {
  				console.log('error while userting DeviceModel: ' + err);
  			}
  			
		});

    };

//db.devicemodels.remove({identity: "device:nikkis@s3mini"})

    this.findMultipleDevices = function(identities, callback) {
    	DeviceModel.find({identity: { $in : identities }}, callback);
    };

    this.findAllDevices = function(callback) {
        DeviceModel.find(callback);
    };
}




