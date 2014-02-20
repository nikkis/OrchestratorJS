ROOT = process.cwd()
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

/*
module.exports = {
    SLEEP_TIMEOUT: 'SLEEP_TIMEOUT',
    METHOD_CALL_RESPONSE: 'METHOD_CALL_RESPONSE',
    OJS_EVENT: 'OJS_EVENT',
    OJS_EXECPTION: 'OJS_EXECPTION',

};

*/



this.SLEEP_TIMEOUT = 'SLEEP_TIMEOUT';
this.METHOD_CALL_RESPONSE = 'METHOD_CALL_RESPONSE';
this.OJS_EVENT = 'OJS_EVENT';
this.OJS_EXCEPTION = 'OJS_EXCEPTION';


this.waitFor = function() {

    var runRet = null;
    var runRetType = null;
    while ( runRetType != 'methodcallresponse' ) {
        try {
            runRet = this.Fiber.yield();
            if ( runRet[ 'runRetType' ] ) {
                runRetType = runRet[ 'runRetType' ];
                log( 'look mom!' );
                log( runRetType );
            }
        } catch ( e ) {}
    }
    //log( runRetType );
    return runRet[ 'runRetValue' ];
};



this.methodcallRunArgs = function( responseValue ) {
    return {
        runReturnType: 'methodcallresponse',
        runReturnValue: responseValue
    };
};