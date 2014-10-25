module.exports = {

  // the body
  body: function ( dev ) {
    
    var misc = require('./misc.js');
    
    dev.testCapability.test();
    misc.sleep(1);
    dev.testCapability.initMeasurement();
    misc.sleep(1);
    dev.testCapability.initMeasurement();
    //dev.testCapability.calculateAverage();
    
    /*
    dev.testCapability.initMeasurement(); 
    
    
    i = 0;
    while ( i < 16 ) {
      ++i;
      dev.testCapability.dummyMethod();
    }
  
  
    dev.testCapability.calculateAverage();
  */
  }

};