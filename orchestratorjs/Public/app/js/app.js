'use strict';


// Declare app level module which depends on filters, and services
angular.module('ojsConsole', [
  'ngRoute',
  'ojsConsole.filters',
  'ojsConsole.services',
  'ojsConsole.services.SocketIOService',
  'ojsConsole.directives',
  'ojsConsole.controllers',
  'ojsConsole.controllers.AppsController',
  'ojsConsole.controllers.DevicesController',
  'ojsConsole.controllers.userControllers',
  //'ojsConsole.controllers.UsersController',
  //'ojsConsole.controllers.SignInController',
  //'ojsConsole.controllers.SignOutController',
  //'ojsConsole.controllers.SignUpController'
]).
config(['$routeProvider', function($routeProvider) {


  $routeProvider.when('/', {templateUrl: 'app/partials/home.html', controller: 'HomeController'});


  $routeProvider.when('/signIn',  {templateUrl: 'app/partials/signIn.html',  controller: 'SignInController'});
  $routeProvider.when('/signOut', {templateUrl: 'app/partials/signOut.html', controller: 'SignOutController'});
  $routeProvider.when('/signUp',  {templateUrl: 'app/partials/signUp.html',  controller: 'SignUpController'});

  // apps
  $routeProvider.when('/apps', {templateUrl: 'app/partials/apps.html', controller: 'AppsController'});
  $routeProvider.when('/app/:appName', {templateUrl: 'app/partials/appEdit.html', controller: 'AppEditController'});

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
