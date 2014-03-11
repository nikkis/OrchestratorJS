module.exports = {

  // the body
  body: function ( dev ) {
    
    dev.testCapability.initMeasurement(); 
    i = 0;
    while ( i < 16 ) {
      ++i;
      dev.testCapability.dummyMethod();
    }
  
  
    dev.testCapability.calculateAverage();
  
  }

};