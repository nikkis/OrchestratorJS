ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/'+config.database);



var actionInstanceDataSchema = mongoose.Schema({
    actionName: { type: String, unique: true },
    args: [],
    lastSeen: { type: Date, default: Date.now },
});


var ActionInstanceDataModel = mongoose.model('actionInstanceDataModel', actionInstanceDataSchema);



module.exports = function actionInstanceDataHandler()
{
    this.findactionInstanceData = function( actionName, next ) {
		    ActionInstanceDataModel.findOne( { actionName: actionName }, next );
    };

    this.createActionInstanceData = function(actionName, args, next ) {
    	var lastSeen = new Date();
    	var query = { actionName: actionName };
      ActionInstanceDataModel.findOneAndUpdate(query, { $set: { actionName: actionName, args: args, lastSeen: lastSeen}}, {upsert: true}, function (err, data) {
          if(!err) {
            log('found or created');
          } else {
            log('error while userting action instance data: ' + err);
          }

          next(err, data);
      });
    };


}




