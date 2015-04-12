var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;
var hostname = "192.168.1.68";
var username = "25fa138c1c7bbacf123c76429e69a67";


var displayResult = function (result) {
    console.log(JSON.stringify(result, null, 2));
};

// I have no idea where this comes from
var scenePostFix = ' on 0';


module.exports = {

    displayBridges: function () {
        var displayBridges = function (bridge) {
            console.log("Hue Bridges Found: " + JSON.stringify(bridge));
        };

        
        hue.nupnpSearch().then(displayBridges).done();

    },

    registerNewUser: function () {

        var newUserName = null;
        userDescription = "Orchestrator.js Middleware";

        var displayUserResult = function (result) {
            console.log("Created user: " + JSON.stringify(result));
        };

        var displayError = function (err) {
            console.log(err);
        };

        var hue = new HueApi();

        // -------------------------- 
        // Using a promise 
        hue.registerUser(hostname, newUserName, userDescription)
            .then(displayUserResult)
            .fail(displayError)
            .done();

    },


    getState: function () {
        var api = new HueApi(hostname, username),
            state;
        api.fullState().then(displayResult).done();
    },


    turnOff: function (bulbName, value) {

        var api = new HueApi(hostname, username),
            state;

        var setState = function (result) {

            for (k in result.lights) {
                console.log(k);
                if (result.lights[k].name == bulbName) {
                    state = lightState.create().off();
                    api.setLightState(k, state).done();
                }
            }
        };

        api.fullState().then(setState).done();
    },

    turnOn: function (bulbName, value) {

        var api = new HueApi(hostname, username),
            state;

        var setState = function (result) {

            for (k in result.lights) {
                console.log(k);
                if (result.lights[k].name == bulbName) {
                    state = lightState.create().on();
                    api.setLightState(k, state).done();
                }
            }
        };

        api.fullState().then(setState).done();
    },

    setColor: function (bulbName, value) {

        var api = new HueApi(hostname, username),
            state;

        var setState = function (result) {

            for (k in result.lights) {
                console.log(k);
                if (result.lights[k].name == bulbName) {
                    state = lightState.create().on().white(500, 100);
                    api.setLightState(k, state).done();
                }
            }
        };

        api.fullState().then(setState).done();
    },

    setSceneOn: function (sceneName) {

        var api = new HueApi(hostname, username),
            state;

        var setSceneOn = function (result) {
            for (k in result) {

                if (result[k].name == sceneName || result[k].name == sceneName + scenePostFix) {
                    console.log(result[k].name);
                    api.activateScene(result[k].id).done();

                }
            }
        };

        api.getScenes().then(setSceneOn).done();
    },


    turnAllOff: function () {

        var api = new HueApi(hostname, username),
            state;

        var setState = function (result) {
            for (k in result.lights) {
                state = lightState.create().off();
                api.setLightState(k, state).done();
            }
        };

        api.fullState().then(setState).done();
    },

    turnAllOn: function () {

        var api = new HueApi(hostname, username),
            state;

        var setState = function (result) {
            for (k in result.lights) {
                state = lightState.create().on();
                api.setLightState(k, state).done();
            }
        };

        api.fullState().then(setState).done();
    }

};