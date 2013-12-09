ROOT = process.cwd()
HELPERS = require(ROOT+'/helpers/general.js');
log = HELPERS.log

/*
module.exports = {
	SLEEP_TIMEOUT: 'SLEEP_TIMEOUT',
	METHOD_CALL_RESPONSE: 'METHOD_CALL_RESPONSE',
	SD_EVENT: 'SD_EVENT',
	SD_EXECPTION: 'SD_EXECPTION',

};

*/





this.SLEEP_TIMEOUT = 'SLEEP_TIMEOUT';
this.METHOD_CALL_RESPONSE = 'METHOD_CALL_RESPONSE';
this.SD_EVENT = 'SD_EVENT';
this.SD_EXCEPTION = 'SD_EXCEPTION';


this.waitFor = function() {

    var runRet = null;
    var runRetType = null;
    while(runRetType != 'methodcallresponse') {
        try {
            runRet = this.Fiber.yield();
            if(runRet['runRetType']) {
                runRetType = runRet['runRetType'];
                log('look mom!');
                log(runRetType);
            }
        }catch(e) {}
    }
    log('juukeli sentaan');
    log(runRetType);
    log('paa lasista');
    return runRet['runRetValue'];
};



this.methodcallRunArgs = function(responseValue) {
	return {runReturnType: 'methodcallresponse', runReturnValue: responseValue};
};










