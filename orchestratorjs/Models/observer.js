ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/'+config.database);



var observerSchema = mongoose.Schema({
    observername: { type: String, unique: true },
    settings: { type: String },
    description: { type: Date, default: Date.now },
});


var observerModel = mongoose.model('observerModel', observerSchema);



module.exports = function observerHandler()
{
    this.findobserver = function(observername, callback) {
		    observerModel.findOne({observername: observername}, callback);
    };

    this.createobserver = function(observername, fullname) {

    	var lastSeen = new Date();
    	var observer = { observername: observername, fullname: fullname, lastSeen: lastSeen };
		
		  observerModel.create(observer, function (err, dev) {
  			if(!err) {
				  console.log(dev.identity);
  			} else {
  				console.log('error while observerting DeviceModel: ' + err);
  			}
		  });
    };


}




