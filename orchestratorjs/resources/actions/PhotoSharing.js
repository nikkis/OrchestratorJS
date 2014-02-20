// the body
this.body = function (d1) {
    
    var misc = require('./misc.js');
    
    
    d1.dialogCapability.showDialog('Do you want coffee?', ['YES','NO'], 60);
    
    while( !d1.dialogCapability.getDialogChoice() ) {
      misc.sleep(5);
    }

    var choice = d1.dialogCapability.getDialogChoice();
    console.log('CHOICE: '+choice);
    	
    d1.talkingCapability.say('the choice is '+choice,'david','0.8');
    
    

};