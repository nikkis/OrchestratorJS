ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require( 'mongoose' );
var db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'Cannot connect to mongodb:' ) );
mongoose.connect( 'mongodb://localhost/' + config.database );



var appSchema = mongoose.Schema( {
  appname: {
    type: String,
    unique: true
  },
  author: {
    type: String
  },
  desc: {
    type: String
  },
  color: {
    type: String
  },
  img: {
    type: String
  },
  edited: {
    type: Date,
    default: Date.now
  },
} );


var appModel = mongoose.model( 'appModel', appSchema );



module.exports = function appHandler() {
  this.findApp = function( appname, next ) {
    appModel.findOne( {
      appname: appname
    }, next );
  };


  this.createApp = function( appname, author, next ) {

    var color = HELPERS.hexColor( appname );
    var edited = new Date();


    var query = {
      appname: appname
    };
    appModel.findOneAndUpdate( query, {
      $set: {
        appname: appname,
        author: author,
        desc: '',
        color: color,
        img: '',
        edited: edited
      }
    }, {
      upsert: true
    }, function( err, data ) {
      if ( !err ) {
        log( 'found or created' );
      } else {
        log( 'error while userting app: ' + err );
      }

      next( err, data );
    } );

  };



  // currently only modifies desc :-(
  this.modifyApp = function( appname, author, desc, next ) {

    var edited = new Date();

    var query = {
      appname: appname,
      author: author
    };
    
    appModel.findOneAndUpdate( query, {
      $set: {
        desc: desc,
        edited: edited
      }
    }, {
      upsert: true
    }, function( err, data ) {
      if ( !err ) {
        log( 'found or created' );
      } else {
        log( 'error editing app: ' + err );
      }

      next( err, data );
    } );

  };






  this.findAllApps = function( callback ) {
    appModel.find( callback );
  };


}