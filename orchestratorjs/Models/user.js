ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log


var config = require( ROOT + '/config.json' );

var mongoose = require( 'mongoose' );
var db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'Cannot connect to mongodb:' ) );
mongoose.connect( 'mongodb://localhost/' + config.database );



var userSchema = mongoose.Schema( {
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  color: {
    type: String
  },  
  edited: {
    type: Date,
    default: Date.now
  },
} );


var UserModel = mongoose.model( 'UserModel', userSchema );



module.exports = function UserHandler() {
  this.findUser = function( username, next ) {
    UserModel.findOne( {
      username: username
    }, next );
  };

  this.verifyUser = function( username, password, next ) {
    UserModel.findOne( {
      username: username,
      password: password
    }, next );
  };

  this.createUser = function( username, password, next ) {
    var color = HELPERS.hexColor( username );
    var edited = new Date();
    var user = {
      username: username,
      password: password,
      color: color,
      edited: edited
    };

    UserModel.create( user, next );

  };


}