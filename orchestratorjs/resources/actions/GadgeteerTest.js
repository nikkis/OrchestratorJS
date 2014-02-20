module.exports = {

    exceptionHandler: function(action, device, exception_value) {
        console.log('error on client-side: '+ device.identity+', '+exception_value);
        action.finishAction();
    },

    eventHandler: function(action, device, event_value) {
        console.log('event from client: '+device.identity+', '+event_value);
    },
    
    
    // the body
    body: function (d1) {
    
    	var misc = require('./misc.js');
    
        d1.multicolorLed.blue();
        misc.sleep(2);
        
        d1.multicolorLed.red();
        misc.sleep(2);
        
        d1.multicolorLed.green();
        
    }
    

};
	