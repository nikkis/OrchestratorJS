'use strict';


// Declare app level module which depends on filters, and services
angular.module('ojsConsole', [
  'ngRoute',
  'ojsConsole.filters',
  
  'ojsConsole.services',
  'ojsConsole.services.UserService',
  'ojsConsole.services.AuthService',
  'ojsConsole.services.SocketIOService',

  'ojsConsole.directives',
  
  'ojsConsole.controllers',
  'ojsConsole.controllers.ActionAndCapabilityControllers',
  'ojsConsole.controllers.AppsController',
  'ojsConsole.controllers.DevicesController',
  'ojsConsole.controllers.userControllers',


]).
config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/', {templateUrl: 'app/partials/home/newhome.html', controller: 'HomeController', access: { isFree: true }});


  $routeProvider.when('/signIn',  {templateUrl: 'app/partials/account/signIn.html',  controller: 'SignInController', access: { isFree: true }});
  $routeProvider.when('/signOut', {templateUrl: 'app/partials/home/newhome.html', controller: 'SignOutController', access: { isFree: true }});
  $routeProvider.when('/signUp',  {templateUrl: 'app/partials/account/signUp.html',  controller: 'SignUpController', access: { isFree: true }});

  $routeProvider.when('/user/:username',  {templateUrl: 'app/partials/account/user.html',  controller: 'UserController', access: { isFree: false }});
  $routeProvider.when('/user/:username/device/:deviceName',  {templateUrl: 'app/partials/account/userDevice.html',  controller: 'UserDeviceController', access: { isFree: false }});

  $routeProvider.when('/user/:username/device/:deviceName/proximity',  {templateUrl: 'app/partials/proximityGraph.html',  controller: 'UserDeviceProximityController', access: { isFree: true }});


  // apps
  $routeProvider.when('/apps',         {templateUrl: 'app/partials/apps/apps.html', controller: 'AppsController', access: { isFree: true } });
  $routeProvider.when('/app/:appName', {templateUrl: 'app/partials/apps/appEdit.html', controller: 'AppEditController', access: { isFree: false }});

  // devices
  $routeProvider.when('/devices', {templateUrl: 'app/partials/devices.html', controller: 'DevicesController', access: { isFree: true }});

  // actions
  $routeProvider.when('/instances', {templateUrl: 'app/partials/actionInstances.html', controller: 'ActionInstancesController', access: { isFree: true }});
  
  //$routeProvider.when('/actions', {templateUrl: 'app/partials/empty.html', controller: 'ActionsController', access: { isFree: true }});
  $routeProvider.when('/actions', {templateUrl: 'app/partials/actionEdit.html', controller: 'ActionEditController', access: { isFree: true }});
  $routeProvider.when('/actions/instances', {templateUrl: 'app/partials/actionInstances.html', controller: 'ActionInstancesController', access: { isFree: true }});

  
  // capabilities
  
  $routeProvider.when('/capabilities', {templateUrl: 'app/partials/capabilityEdit.html', controller: 'CapabilityEditController', access: { isFree: true }});
  $routeProvider.when('/capabilitiesOld', {templateUrl: 'app/partials/empty.html', controller: 'CapabilitiesController', access: { isFree: true }});

  // instructions
  $routeProvider.when('/develop', {templateUrl: 'app/partials/docs/developGeneral.html', controller: 'DocsController', access: { isFree: true }});
  $routeProvider.when('/develop/android', {templateUrl: 'app/partials/docs/developAndroid.html', controller: 'DocsController', access: { isFree: true }});
  $routeProvider.when('/develop/gadgeteer', {templateUrl: 'app/partials/docs/developGadgeteer.html', controller: 'DocsController', access: { isFree: true }});
  $routeProvider.when('/api', {templateUrl: 'app/partials/docs/developAPI.html', controller: 'DocsController', access: { isFree: true }});


  $routeProvider.otherwise({redirectTo: ''});
}]);
