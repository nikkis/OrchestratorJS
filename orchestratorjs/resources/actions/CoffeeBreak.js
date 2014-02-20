module.exports = {

  // the body
  body: function ( coffeeMachine, companionDevice ) {
    var tools = require('./misc.js');
        
    var question = companionDevice.ownerName + ', do you want coffee?'; 
    companionDevice.talkingCapability.say( question,'david','0.8');
    companionDevice.dialogCapability.showDialog( question, ['YES','NO'], 60 );
    while( !companionDevice.dialogCapability.getDialogChoice() )
      tools.sleep(5);
        
    var choice = companionDevice.dialogCapability.getDialogChoice();
    if( choice != 'YES' )
      return;
 
    coffeeMachine.coffeeCapability.makeCoffee(); 
  }
};
	