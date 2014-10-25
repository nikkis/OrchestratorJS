
module.exports = {

  // the body
  body: function ( d1 ) {
 
    var v = d1.talkingCapability.say( 'no moi!','david','1.2');
  	
    log(v);
  }
};