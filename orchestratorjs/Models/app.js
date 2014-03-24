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


//  this.createApp = function( appname, author, desc, img, next ) {
  this.createApp = function( appname, author, next ) {
    var color = HELPERS.hexColor( appname );
    var edited = new Date();
    var app = {
      appname: appname,
      author: author,
      desc: '',
      color: color,
      img: '',
      edited: edited
    };

    appModel.create( app, next );

  };

  this.findAllApps = function( callback ) {
    appModel.find( callback );
  };


}