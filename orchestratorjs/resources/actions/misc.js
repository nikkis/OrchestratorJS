ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log
runYieldHelpers = require(ROOT+'/helperForRunYield.js');

this.sleep = function(ms) {

    var Fiber = require('fibers');
    var sleepResponseArgs = {runRetType: runYieldHelpers.SLEEP_TIMEOUT};

    var runRet = null;
    var runRetType = null;
    while(runRetType != sleepResponseArgs['runRetType']) {
        try {
            var fiber = Fiber.current;
            setTimeout(function() {
                if(fiber !== undefined) {
                    fiber.run(sleepResponseArgs);
                }
            }, ms*1000);
            runRet = Fiber.yield();
            console.log('yield off');
            console.log(runRet);
            if(runRet['runRetType']) {
                runRetType = runRet['runRetType'];
            }
        }catch(err){
            log(err);
        }
    }
};




this.waitFor = function(responseStrTowait) {
    this.waitForStr = responseStrTowait;
    var resVal = 'asdf-asdf--asf-_sdfasdf';
    while(resVal != this.waitForStr) {
        try {
            resVal = Fiber.yield();
        } catch (err) {
            console.log(err);
        }
    }
    console.log('no more waiting, got: '+resVal);
}