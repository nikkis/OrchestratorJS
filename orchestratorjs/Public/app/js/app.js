'use strict';


// Declare app level module which depends on filters, and services
angular.module('ojsConsole', [
  'ngRoute',
  'ojsConsole.filters',
  'ojsConsole.services',
  'ojsConsole.services.SocketIOService',
  'ojsConsole.directives',
  'ojsConsole.controllers',
  'ojsConsole.controllers.ObserversController',
  'ojsConsole.controllers.DevicesController'
]).
config(['$routeProvider', function($routeProvider) {

  // observers
  $routeProvider.when('/observers', {templateUrl: 'app/partials/observers.html', controller: 'ObserversController'});
  $routeProvider.when('/observer/:observerName', {templateUrl: 'app/partials/observerEdit.html', controller: 'ObserverEditController'});

  $routeProvider.when('/instances', {templateUrl: 'app/partials/empty.html', controller: 'ActionInstancesController'});
  $routeProvider.when('/devices', {templateUrl: 'app/partials/devices.html', controller: 'DevicesController'});
  $routeProvider.when('/actions', {templateUrl: 'app/partials/empty.html', controller: 'ActionsController'});
  $routeProvider.when('/capabilities', {templateUrl: 'app/partials/empty.html', controller: 'CapabilitiesController'});

  // instructions
  $routeProvider.when('/develop', {templateUrl: 'app/partials/docs/developGeneral.html', controller: 'DocsController'});
  $routeProvider.when('/develop/android', {templateUrl: 'app/partials/docs/developAndroid.html', controller: 'DocsController'});
  $routeProvider.when('/develop/gadgeteer', {templateUrl: 'app/partials/docs/developGadgeteer.html', controller: 'DocsController'});
  $routeProvider.when('/api', {templateUrl: 'app/partials/docs/developAPI.html', controller: 'DocsController'});


  $routeProvider.otherwise({redirectTo: ''});
}]);
