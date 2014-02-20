ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/'+config.database);



var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    fullName: { type: String },
    lastSeen: { type: Date, default: Date.now },
});


var UserModel = mongoose.model('UserModel', userSchema);



module.exports = function UserHandler()
{
    this.findUser = function(username, callback) {
		    UserModel.findOne({username: username}, callback);
    };

    this.createUser = function(username, fullname) {

    	var lastSeen = new Date();
    	var user = { username: username, fullname: fullname, lastSeen: lastSeen };
		
		  UserModel.create(user, function (err, dev) {
  			if(!err) {
				  console.log(dev.identity);
  			} else {
  				console.log('error while userting DeviceModel: ' + err);
  			}
		  });
    };


}




