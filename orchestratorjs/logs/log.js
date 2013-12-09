ROOT = process.cwd()
var config = require(ROOT+'/config.json');
console.log("logs go to: "+ROOT+config.log_path);


var winston = require('winston');


var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: ROOT+config.log_path+'debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: ROOT+config.log_path+'exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports = logger;


/*

var winston = require('winston');

module.exports = function (module) {

  var filename = module.id;
  return {
    info : function (msg, vars) { 
      winston.info(filename + ': ' + msg, vars); 
    }
  }
};
*/