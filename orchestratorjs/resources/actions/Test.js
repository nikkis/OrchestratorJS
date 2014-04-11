module.exports = {

  // the body
  body: function ( d1 ) {
    

    var v = d1.talkingCapability.say( 'moi olen ios client','david','1.2');
	  console.log('v');
  	console.log(v);
    
    var misc = require('./misc.js');
    
    misc.sleep(40);
  
  
  }
  
};
