// the body
this.body = function (d1) {
    

    var misc = require('./misc.js');
      
		var s = 'say yes or no';
    d1.talkingCapability.say(s);
    d1.dialogCapability.showDialog(s, ['YES','NO'], 60);
    while( !d1.dialogCapability.getDialogChoice() ) {
      misc.sleep(1);
    }

    var choice = d1.dialogCapability.getDialogChoice();
    console.log('CHOICE: '+choice);
    	
    d1.talkingCapability.say('the choice is '+choice,'david','0.8');
    
    

};