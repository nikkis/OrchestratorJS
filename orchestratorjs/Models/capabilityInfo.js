ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/'+config.database);



var capabilityInfoSchema = mongoose.Schema({
  author: { type: String },
  capabilityName: { type: String },
  codeCompletionLines: []
});


var capabilityInfoModel = mongoose.model('capabilityInfoModel', capabilityInfoSchema);



module.exports = function capabilityInfoHandler()
{
    this.findCapabilityInfo = function(author, capabilityName, next) {
		    capabilityInfoModel.findOne( { author: author, capabilityName: capabilityName }, next );
    };


    this.upsertCapabilityInfo = function( author, capabilityName, codeCompletionLines, next) {

      var query = { author: author, capabilityName: capabilityName };
      capabilityInfoModel.findOneAndUpdate(query, { $set: { author: author, capabilityName: capabilityName, codeCompletionLines: codeCompletionLines } }, { upsert: true }, function (err, data) {
          if(!err) {
            log('found or created');
          } else {
            log('error while userting capability info: ' + err);
          }

          //next( err, data );
      });
    };



    this.findAll = function( callback ) {
      capabilityInfoModel.find( callback );
    };
}




