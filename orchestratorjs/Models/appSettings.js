ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Cannot connect to mongodb:'));
mongoose.connect('mongodb://localhost/'+config.database);



var appSettingSchema = mongoose.Schema({
  username: { type: String },
  appName: { type: String },
  settings: {}
});


var appSettingsModel = mongoose.model('appSettingModel', appSettingSchema);



module.exports = function appSettingHandler()
{
    this.findAppSettings = function(username, appName, next) {
		    appSettingsModel.findOne( { username: username, appName: appName }, next );
    };


    this.upsertAppSettings = function( username, appName, settings, next) {

      var query = { username: username, appName: appName };
      appSettingsModel.findOneAndUpdate(query, { $set: { username: username, appName: appName, settings: settings } }, { upsert: true }, function (err, data) {
          if(!err) {
            log('found or created');
          } else {
            log('error while userting app settings: ' + err);
          }

          next( err, data );
      });
    };
}




