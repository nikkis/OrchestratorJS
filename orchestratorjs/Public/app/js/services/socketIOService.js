var app = angular.module('ojsConsole.services.SocketIOService', []);

console.log('KYRPÄ');

var ojsDeviceRegistryServicePort = 9001;

app.factory('socket', function ($rootScope) {

    console.log('VITTU');

    var socket = io.connect('http://' + hostName + ':' + pubsubPort);

    console.log('SAATANA');
    return {
        on: function (eventName, callback) {

            console.log('HUORA');

            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };

});