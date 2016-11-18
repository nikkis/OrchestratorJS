const util = require('util');

function ins(o) {
    console.log('INS:\n' + util.inspect(o, {
        showHidden: true,
        depth: null
    }));
}

var PATH_TO_ACTIONS = './Actions/';
module.exports = {
    create: function (thisApp, actionName) {

        var constructAction = require(PATH_TO_ACTIONS + actionName + '.js');

        var action = constructAction(thisApp);

        return action;

    }
};