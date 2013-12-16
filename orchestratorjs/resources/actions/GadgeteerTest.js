
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
    
        d1.multicolorLed.blue();
        d1.multicolorLed.red();
        d1.multicolorLed.green();
        
    }
    

};
	