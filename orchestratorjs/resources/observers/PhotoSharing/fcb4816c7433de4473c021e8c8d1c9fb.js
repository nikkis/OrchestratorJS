var httprequest = require( '../../tools.js' ).httprequest;
var pubsub      = require( '../../tools.js' ).pubsub();
var Fiber       = require( 'fibers' );
var tools       = require( '../../tools.js' );

var TheAppModule =  module.exports = {

settings: {"coffeeMachineId":"jee"},

logic: function () {

      Fiber( function() {

        while ( true ) {

          console.log( 'locationObserver - tick' );

          tools.sleep( 10 );

        }

      } ).run();


  }

};

var settings = {"coffeeMachineId":"jee"};

TheAppModule.logic();