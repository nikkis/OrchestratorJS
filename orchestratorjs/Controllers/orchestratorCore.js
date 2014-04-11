ROOT = process.cwd();
HELPERS = require( ROOT + '/helpers/general.js' );
log = HELPERS.log

var config = require( ROOT + '/config.json' );

var colors = require( 'colors' );
var Fiber = require( 'fibers' );

var runYieldHelpers = require( ROOT + '/helpers/helperForRunYield.js' );
var DeviceHandler = require( ROOT + '/Models/devicesHandler' );
var DEVICE_HANDLER = new DeviceHandler();
var ACTION_INSTANCE_DATA_HANDLER = new( require( ROOT + '/Models/actionInstanceData' ) );

var actionPool = {};
var CONNECTION_POOL = {};

var waitForResponse1 = false;
var myInterVal = null;

var MAXIMUM_WAIT_TIME_FOR_METHODCALL = 5000;

var socket = require( 'socket.io' );


// initialize clients for the services
var ojsDeviceRegistrySocket = ( config.services.ojsDeviceRegistry.enabled ) ? require( 'socket.io-client' ).connect( 'http://0.0.0.0:' + config.services.ojsDeviceRegistry.port ) : undefined;
var ojsConsoleSocket = ( config.services.ojsConsole.enabled ) ? require( 'socket.io-client' ).connect( 'http://0.0.0.0:' + config.services.ojsConsole.port ) : undefined;


//HELPERS.printHost();


var APP = null;
this.initialize = function( app ) {
  APP = app;
  var server = APP.listen( config.server.port );
  var io = socket.listen( server, {
    log: config.server.socketio_debug
  } );
  if ( !config.server.socketio_debug )
    io.set( 'log level', 0 );

  io.sockets.on( 'connection', function( socket ) {
    log( 'connection' );

    socket.on( 'disconnect', function( deviceid ) {
      console.log( 'disconnect' );
      log( 'deleting connection for ' + deviceid );
      log( socket.id );
      var removeThisDeviceConnection = null;
      for ( device_id in CONNECTION_POOL ) {

        if ( ( CONNECTION_POOL[ device_id ] ).id == socket.id ) {
          DEVICE_HANDLER.deviceOffline( device_id );
          log( 'deleting' );
          removeThisDeviceConnection = device_id;
        }
      }
      if ( removeThisDeviceConnection ) {
        delete CONNECTION_POOL[ removeThisDeviceConnection ];
      }
    } );

    socket.on( 'login', function( deviceid ) {
      log( 'login' );
      log( socket[ 'id' ] );
      CONNECTION_POOL[ deviceid ] = socket;
      DEVICE_HANDLER.deviceOnline( deviceid );
      log( 'initialized Connection for device: ' + deviceid );

      // send information about the orchestrator configuration
      /*
      var temp = {
        "services": {
          "ojsConsolePort": config.services.ojsConsole.port,
          "ojsDeviceRegistryPort": config.services.ojsDeviceRegistry.port
        }
      };
      socket.emit( 'ojs_info', temp );
      */

    } );


    /*
     
    //////////////////////////////////////////
    // For testing
    socket.on( 'test', function( deviceid ) {
      p( 'test event received' );
    } );
    //////////////////////////////////////////



    socket.on( 'message', function( jsonString ) {
      log( 'message' );
      // tries to parse methodcall response
      try {
        log( jsonString );
        socket.send( 'check!' );
        log( 'reply message end' );
      } catch ( err ) {
        log( err );
      }
    } );


    // receive test
    socket.on( 'test', function( val1, val2 ) {
      log( 'test' );
      log( val1 );

      waitForResponse1 = false;
      if ( myInterVal != null ) {
        clearInterval( myInterVal );
      }

      log( 'test end' );
    } );

    */

    // receive methodCallResponse from device
    socket.on( 'methodcallresponse', function( actionId, methodCallId, methodCallResponseValue, methodCallResponseType ) {
      log( 'methodcallresponse' );
      try {

        /*
        log( 'response for action: ' + actionId );
        log( 'methodcall id: ' + methodCallId );
        log( 'methodCallResponseType: ' + methodCallResponseType );
        log( 'methodCallResponseValue:' );
        log( methodCallResponseValue )
        */

        if ( methodCallResponseType == 'INT' ) {
          methodCallResponseValue = parseInt( methodCallResponseValue );
        }
        a = actionPool[ actionId ];
        //a.handleResponse(methodCallResponseValue);
        a.handleResponse( actionId, methodCallId, methodCallResponseValue, methodCallResponseType );
      } catch ( e ) {
        log( e );
      }
      log( 'methodcallresponse end' );
    } );


    socket.on( 'ojs_exception', function( actionId, methodCallId, device_id, exception_str ) {
      log( 'ojs_exception for action: ' + actionId );
      log( 'exception_str:' );
      log( exception_str );

      if ( actionPool[ actionId ] ) {
        a = actionPool[ actionId ];
        a.handleException( methodCallId, device_id, exception_str );
      }
      log( 'ojs_exception end' );
    } );



    socket.on( 'ojs_event', function( actionId, device_id, event_value ) {
      log( 'ojs_event for action: ' + actionId );
      log( 'event_value:' );
      log( event_value );

      if ( actionPool[ actionId ] ) {
        a = actionPool[ actionId ];
        a.handleEvent( device_id, event_value );
      }
      log( 'ojs_event end' );
    } );


    // save changed metadata and emit to observers and browsers
    socket.on( 'ojs_context_data', function( actionId, deviceId, metadataDict ) {
      DEVICE_HANDLER.upsertMetadata( deviceId, metadataDict, function( err, devices ) {} );
    } );


    // rely the log messages ahead to browsers
    socket.on( 'ojs_log', function( actionId, deviceId, message ) {
      if ( config.services.ojsConsole.enabled )
        ojsConsoleSocket.emit( 'ojs_log', actionId, deviceId, message );

    } );

  } );


  log( 'orchestrator initialized' );
}


this.getDevices = function( req, res ) {

  DEVICE_HANDLER.findAllDevices( function( err, devices ) {

    var metadataFieldsForView = [];
    var capabilitiesList = {};
    var responseDevices = [];
    for ( i in devices ) {
      var tempDev = {};
      var devModel = devices[ i ];
      tempDev[ 'identity' ] = devModel.identity;
      tempDev[ 'deviceName' ] = devModel.name;
      tempDev[ 'bluetoothMAC' ] = devModel.bluetoothMAC;
      tempDev[ 'lastSeen' ] = devModel.lastSeen;
      tempDev[ 'username' ] = devModel.username;
      tempDev[ 'type' ] = devModel.type;
      tempDev[ 'metadata' ] = ( devModel.metadata ) ? devModel.metadata : {};

      for ( key in tempDev.metadata ) {
        if ( metadataFieldsForView.indexOf( key ) == -1 ) {
          metadataFieldsForView.push( key );
        }
      }

      if ( !devModel.capabilities )
        continue;

      var capabilityNames = ( devModel.capabilities ).sort();

      tempDev[ 'capabilities' ] = [];
      var capabiltitiesAndColors = [];
      for ( var i = 0; i < capabilityNames.length; i++ ) {
        var capa = capabilityNames[ i ];
        var cColor = HELPERS.hashCode( capa );
        capabiltitiesAndColors.push( {
          "color": HELPERS.hashCode( capa ),
          "name": capa
        } );
        capabilitiesList[ capa ] = cColor;
      }
      tempDev[ 'capabilities' ] = capabiltitiesAndColors;

      tempDev[ 'online' ] = ( CONNECTION_POOL[ devModel.identity ] ) ? true : false;

      log( tempDev.capabilities );

      responseDevices.push( tempDev );
    }
    res.writeHead( 200, {
      "Content-Type": "application/json"
    } );

    var response = {
      devices: responseDevices,
      capabilities: capabilitiesList,
      metadataFields: metadataFieldsForView
    };
    res.write(
      JSON.stringify( response )
    );
    res.end();
  } );
};
this.getActionInstances = function( req, res ) {

  var response = [];
  for ( action_id in actionPool ) {
    var action = actionPool[ action_id ];
    var tempDetails = {};
    tempDetails[ 'name' ] = action.name;
    tempDetails[ 'identity' ] = action.id;
    tempDetails[ 'participants' ] = [];
    for ( i in action.participants ) {
      var deviceModel = action.participants[ i ];
      tempDetails[ 'participants' ].push( deviceModel.identity );
    }
    response.push( tempDetails );
  }
  res.writeHead( 200, {
    "Content-Type": "application/json"
  } );
  res.write(
    JSON.stringify( {
      "actioninstances": response
    } )
  );
  res.end();
};


this.deleteActionInstance = function( req, res ) {
  var actioninstanceID = req.params.actioninstanceID;
  log( 'killing: ' + actioninstanceID );
  actionFinishHandler( actioninstanceID );
  res.send('Killing action with id: '+actioninstanceID);
}



this.postActionInstance = function( req, res ) {

  var actionName = req.body[ 'actionName' ];
  var parameters = req.body[ 'parameters' ];

  // save the parameters
  ACTION_INSTANCE_DATA_HANDLER.createActionInstanceData( actionName, parameters, function( err, metadata ) {} );

  function getIdentities( params ) {
    for ( i in params ) {
      var param = params[ i ];
      log( 'param: ' + param );
      if ( param instanceof Array ) {
        getIdentities( param );
      } else {
        if ( param.slice( 0, 7 ) == 'device:' ) {
          log( param.slice( 7 ) );
          deviceIdentities.push( param.slice( 7 ) );
        }
      }
    }
  }


  var deviceIdentities = [];
  getIdentities( parameters );


  DEVICE_HANDLER.findMultipleDevices( deviceIdentities, function( err, devices ) {

    try {

      if ( err || deviceIdentities.length !== devices.length ) {
        throw ( 'Not all devices found' );
      } else {

        var actionId = executeAction( res, actionName, devices, parameters );
        var body = actionId + '\n';
        log( 'Action instance (' + actionId + ') created' );
        res.setHeader( 'Content-Type', 'text/plain' );
        res.setHeader( 'Content-Length', body.length );
        res.end( body );
      }

    } catch ( err ) {
      log( 'Error while creating action instance: ' + err );
      var body = 'Error: ' + err + '\n';
      res.setHeader( 'Content-Type', 'text/plain' );
      res.setHeader( 'Content-Length', body.length );
      res.end( body );
    }
  } );
};



function DeviceStub( identity, name, action ) {
  this.identity = identity;
  this.deviceName = name;
  this.action = action;
  this.ownerName = name;

  this.invoke = function( methodArguments ) {
    return this.action.sendMethodCall( this.identity, methodArguments );
  }

  this.destroy = function() {
    this.action = null;
    //this.identity = null;
    this.deviceName = null;
    log( 'deviceStub for id ' + this.identity + ' destroyed!' );
  }
}


function generateCapabilityStub( deviceId, actionid, capabilityName, action, deviceStub ) {

  function GeneralStub( socket, deviceId, actionId, action, deviceStub ) {
    this.Fiber = require( 'fibers' );
    this.socket = socket;
    this.actionId = actionId;
    //this.action = action;
    this.device = deviceStub;
    this.deviceId = deviceId;
  };
  var socket = CONNECTION_POOL[ deviceId ];
  var CapabilityStub = require( ROOT + config.resources.capability_stubs + capabilityName + '.js' );

  var tempStub = new GeneralStub( socket, deviceId, actionid, action, deviceStub );

  for ( methodName in CapabilityStub ) {
    tempStub[ methodName ] = CapabilityStub[ methodName ]
  }

  return tempStub;
}


function createDevices( deviceModels, actionId, action ) {
  var deviceStubs = [];
  for ( i in deviceModels ) {
    var deviceId = deviceModels[ i ].identity;
    var deviceName = deviceModels[ i ].username;

    var deviceStub = new DeviceStub( deviceId, deviceName, action );
    if ( !CONNECTION_POOL[ deviceId ] ) {
      throw ( 'Device with id: ' + deviceId + ' not connected!' );
    }

    var capabilityNames = ( deviceModels[ i ].capabilities ).sort();
    var capabiltitiesAndColors = [];
    for ( var i = 0; i < capabilityNames.length; i++ ) {
      var capa = capabilityNames[ i ];
      deviceStub[ capa[ 0 ].toLowerCase() + capa.slice( 1 ) ] = generateCapabilityStub( deviceId, actionId, capabilityNames[ i ], action, deviceStub );
      //deviceStubs.push(deviceStub);
    }
    deviceStubs.push( deviceStub );
  };
  return deviceStubs;
}



function ActionRunnable( actionName ) {

  this.actionKilled = false;
  this.destroy = function() {
    this.actionKilled = true;
    for ( i in this.participants ) {
      this.participants[ i ].destroy();
      this.participants[ i ] = null;
    }
    this.participants = null;
    this.Fiber = null;
    this.name = null;
    //this.id = null;
    this.bodyInstanceFiber = null;
    this.exceptionHandlerFiber = null;
    this.eventHandlerFiber = null;
    log( 'destructor executed for action: ' + this.id );

  };

  this.finishAction = function() {
    actionFinishHandler( this.id );
  }

  this.Fiber = require( 'fibers' );

  this.name = actionName;
  this.id = HELPERS.getUniqueId();
  this.participants = {};

  this.bodyInstanceFiber = undefined;
  this.setBodyInstance = function( bI ) {
    this.bodyInstanceFiber = bI;
  }

  this.run = function( runResponse ) {
    try {
      if ( this.exceptionHandlingOn ) {
        log( 'option: exceptionhandler run' );
        this.exceptionHandlerFiber.run( runResponse );
      } else if ( this.eventHandlingOn ) {
        log( 'option: eventhandler run' );
        this.eventHandlerFiber.run( runResponse );
      } else {
        log( 'option: bodyinstance run' );
        this.bodyInstanceFiber.run( runResponse );
      }
    } catch ( xx ) {
      log( 'xx run exp: ' + xx );
    }
  }


  this.handleResponse = function( actionId, methodCallId, methodCallResponseValue, methodCallResponseType ) {
    //log('handling response..');
    var runResponse = {
      runRetType: runYieldHelpers.METHOD_CALL_RESPONSE,
      runRetValue: methodCallResponseValue,
      methodCallId: methodCallId
    };
    this.run( runResponse );
  };


  this.defaultExceptionHandler = function( action, device_id, exception_str ) {

    // Implement here your own exception handler
    log( 'Handling error, reason was: ' + exception_str + ', blame: ' + device_id );

  };

  this.sendMethodCall = function( deviceId, methodArguments ) {

    if ( this.actionKilled ) {
      log( 'ACTION WAS KILLED, CANNOT EXECUTE: ' + methodArguments );
      actionFinishHandler( this.id );
      return;
    }

    log( 'sending message' );

    // TODO: wait/yield here if inSync


    var soc = CONNECTION_POOL[ deviceId ];

    var methodCallId = this.id + '_' + HELPERS.getUniqueId();
    log( 'methodcallid: ' + methodCallId );
    var arguments = [ this.id, methodCallId ];
    var allArgs = arguments.concat( methodArguments );
    soc.emit( 'methodcall', allArgs );


    log( 'method call sent.. waiting for response' );

    // TODO: set here timeout which throws exception or creates error if devices not responding for a long time

    runYieldHelpers = require( ROOT + '/helpers/helperForRunYield.js' );
    var runRet = null;
    var runRetType = null;
    while ( runRetType != runYieldHelpers.METHOD_CALL_RESPONSE && runRetType != runYieldHelpers.OJS_EXCEPTION ) {
      try {
        log( 'while waiting for method call response' );

        Fiber = require( 'fibers' );
        runRet = Fiber.yield();

        // handle regular method calls and also methodcalls executed from event handlers
        if ( runRet[ 'runRetType' ] && runRet[ 'runRetType' ] == runYieldHelpers.METHOD_CALL_RESPONSE ) {
          if ( runRet[ 'methodCallId' ] && runRet[ 'methodCallId' ] == methodCallId ) {
            runRetType = runRet[ 'runRetType' ];
            break;
          }

          // handle exceptions
        } else if ( runRet[ 'runRetType' ] && runRet[ 'runRetType' ] == runYieldHelpers.OJS_EXCEPTION ) {
          runRetType = runRet[ 'runRetType' ];
          break;
        }
      } catch ( e ) {
        log( e );
      }
    }
    log( 'got response for: ' + methodCallId );
    return runRet[ 'runRetValue' ];
  };


  /*
    this.handleException = function(methodCallId, device_id, exception_str) {
        log('Calling defaultExceptionHandler');
        try {
            this.defaultExceptionHandler(this, device_id, exception_str);
        } catch(doubleError) {
            log('Error while executing exception handler: '+doubleError);
            actionFinishHandler(this.id);
        }

        if(device_id == 'server') {
            log('server side error handled');
            actionFinishHandler(this.id);
        }
    };
*/

  /*
   *   This handles server-side exceptions, so basically just informs clients and then destroies the action
   */
  this.serverSideserverSideExceptionHandlerFiber = null;
  this.serverSideExceptionHandlingOn = false;
  this.serverSideExceptionHandler = function( exception_value ) {
    log( 'default server-side exception handling because of: ' + exception_value );
  };
  this.handleServerSideException = function( exception_value ) {
    log( 'handling server-side exception: ' + exception_value );

    this.serverSideExceptionHandlingOn = true;
    var exceptionActionIdentity = this.id;
    this.serverSideserverSideExceptionHandlerFiber = Fiber( function() {
      try {
        var fiber = Fiber.current;
        this.action = actionPool[ exceptionActionIdentity ];
        this.action.serverSideExceptionHandler( exception_value );
        this.action.serverSideExceptionHandlingOn = false;
        log( 'server-side exception executed, killing the action' );
        actionFinishHandler( this.action.id );


      } catch ( eeer ) {
        log( eeer );
        log( 'serverSideExceptionHandler destroying action instance: ' + exceptionActionIdentity );
        actionFinishHandler( exceptionActionIdentity );
      }
    } );

    var runResponse = {
      runRetType: runYieldHelpers.OJS_EXCEPTION
    };
    this.serverSideserverSideExceptionHandlerFiber.run( runResponse );
  };



  /*
   *   This handles client side exceptions, exceuting action-specific or (default) exception handler
   */
  this.exceptionHandlerFiber = null;
  this.exceptionHandlingOn = false;
  this.exceptionHandler = function( action, device, exception_value ) {
    log( 'handling exception' );
  };
  this.handleException = function( methodCallId, device_id, exception_value ) {
    log( 'handling exception..' );

    this.exceptionHandlingOn = true;
    var exceptionActionIdentity = this.id;
    this.exceptionHandlerFiber = Fiber( function() {
      try {
        var fiber = Fiber.current;
        this.action = actionPool[ exceptionActionIdentity ];
        this.action.exceptionHandler( this.action, this.action.participants[ device_id ], exception_value );
        this.action.exceptionHandlingOn = false;
        log( 'exception (' + exception_value + ') of method call ' + methodCallId + ' executed' );

        // release here bodyInstanceFiber because error happened on client side and still waiting for response                
        log( 'client-side exception' );
        var runResponse = {
          runRetType: runYieldHelpers.OJS_EXCEPTION,
          methodCallId: methodCallId,
          runRetValue: undefined
        };
        this.action.run( runResponse );

      } catch ( eeer ) {
        log( eeer );
        //log('exceptionHandler destroying action instance: '+exceptionActionIdentity);
        //actionFinishHandler(exceptionActionIdentity);
        this.action.handleServerSideException( eeer );
      }
    } );

    var runResponse = {
      runRetType: runYieldHelpers.OJS_EXCEPTION
    };
    this.exceptionHandlerFiber.run( runResponse );
  };



  this.eventHandlerFiber = null;
  this.eventHandlingOn = false;
  this.eventHandler = function( action, device, event_value ) {
    log( 'handling event' );
  };
  this.handleEvent = function( device_id, event_value ) {
    log( 'handling event..' );

    this.eventHandlingOn = true;
    var eventActionIdentity = this.id;
    this.eventHandlerFiber = Fiber( function() {
      try {
        var fiber = Fiber.current;
        this.action = actionPool[ eventActionIdentity ];
        this.action.eventHandler( this.action, this.action.participants[ device_id ], event_value );
        this.action.eventHandlingOn = false;
        log( 'evenhandler executed' );
      } catch ( eeer ) {
        log( eeer );
        //log('eventHandler destroying action instance: '+eventActionIdentity);
        //actionFinishHandler(eventActionIdentity);
        this.action.handleServerSideException( eeer );
      }
    } );

    var runResponse = {
      runRetType: runYieldHelpers.OJS_EVENT
    };
    this.eventHandlerFiber.run( runResponse );
  };



  // add here the developer defined Action body function
  this.body = undefined;


}


function g( object, func, args ) {
  func.apply( object, args );
}


function executeAction( res, actionName, deviceModels, parameters ) {

  try {
    var bodyDefinition = HELPERS.reRequire( ROOT + config.resources.actions + actionName + '.js' );

    var action = new ActionRunnable( actionName );
    action.body = bodyDefinition.body;
    //action.participants = deviceModels;


    if ( bodyDefinition[ 'exceptionHandler' ] ) {
      action.exceptionHandler = bodyDefinition[ 'exceptionHandler' ];
    }
    if ( bodyDefinition[ 'serverSideExceptionHandler' ] ) {
      action.serverSideExceptionHandler = bodyDefinition[ 'serverSideExceptionHandler' ];
    }
    if ( bodyDefinition[ 'eventHandler' ] ) {
      action.eventHandler = bodyDefinition[ 'eventHandler' ];
    }

    // create the device stubs
    var deviceStubs = createDevices( deviceModels, action.id, action );

    /*
        function replaceIdsWithStubs(devStub, params) {
            var deviceTemp = 'device:'+devStub.identity;
            for(j in params) {
                var param = params[j];
                if(param instanceof Array) {
                    replaceIdsWithStubs(devStub, param);
                } else {
                    if(param == deviceTemp) {
                        params[j] = devStub;
                        log('pimpom: '+deviceTemp);
                    }
                }
            }
        }

        for(i in deviceStubs) {
            log('kakaa: '+deviceStubs[i].identity);
            replaceIdsWithStubs(deviceStubs[i], parameters);
            action.participants[deviceStubs[i].identity] = deviceStubs[i];
        }
*/

    function getStubByDeviceIdParam( device_id_param ) {
      log( device_id_param );
      var r = undefined;
      for ( j in deviceStubs ) {
        var stub = deviceStubs[ j ];
        if ( device_id_param == 'device:' + stub.identity ) {
          log( 'match' );
          return stub;
        }
      }
      return r;
    }

    function replaceIdsWithDevices( paramsArray ) {
      for ( i in paramsArray ) {
        var param = paramsArray[ i ];
        if ( param instanceof Array ) {
          replaceIdsWithDevices( param );
        } else if ( param.slice( 0, 7 ) == 'device:' ) {
          log( 'device param: ' + param );
          paramsArray[ i ] = getStubByDeviceIdParam( param );
        } else {
          log( 'regular param: ' + param );
        }
      }
    }

    replaceIdsWithDevices( parameters );
    for ( i in deviceStubs ) {
      
      /*log( 'dev: ' + deviceStubs[ i ].deviceName );
      if ( deviceStubs[ i ] instanceof DeviceStub ) {
        log( 'juuu u' );
      } else {
        log( 'eee ii' );
      }*/


      action.participants[ deviceStubs[ i ].identity ] = deviceStubs[ i ];
    }

    var bodyInstanceFiber = Fiber( function() {
      try {
        var fiber = Fiber.current;
        var o = {
          mySuper: this
        };
        var p = action.body;
        g( o, p, parameters );
        actionFinishHandler( action.id );
      } catch ( serverSideError ) {
        log( serverSideError );
        try {
          //action.handleException('no-method-id','server',serverSideError);
          action.handleServerSideException( serverSideError );
        } catch ( doubleError ) {
          log( 'Error while handling server side error: ' + doubleError );
          actionFinishHandler( action.id );
        };
      }
    } );

    action.setBodyInstance( bodyInstanceFiber );
    action.run();

    actionPool[ action.id ] = action;

    return action.id;
  } catch ( error ) {
    log( error );
    throw ( error );
  }
}

function actionFinishHandler( actionid ) {
  function sleep( ms ) {
    try {
      var fiber = Fiber.current;
      setTimeout( function() {
        if ( fiber !== undefined ) {
          fiber.run();
        }
      }, ms * 1000 );
      Fiber.yield();
    } catch ( err ) {
      log( err );
    }
  }

  sleep( 3 );
  removeActionInstance( actionid );
  log( 'action instance (' + actionid + ') destroyed' );
}


function removeActionInstance( actionId ) {
  try {
    log( 'removing action instance: ' + actionId );
    if ( actionPool[ actionId ] ) {
      try {
        actionPool[ actionId ].destroy();
        actionPool[ actionId ] = null;
      } catch ( ww ) {
        log( 'cannot destroy: ' + ww );
      }
      delete actionPool[ actionId ];
    }
  } catch ( err ) {
    log( err );
  }
}