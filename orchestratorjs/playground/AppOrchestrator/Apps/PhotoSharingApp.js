const util = require('util');


var Action = require('../Action.js');

module.exports = function PhotoSharingApp() {


    var action = Action.create(this, 'SharePhotoAction');

    var appState = {
        'currentPhoto': null,
        'currentPhotoOwner': null
    };
    var triggeringEvents = ['currentPhotoChanged'];


    this.addAction(triggeringEvents, appState, action);

    // Rest of the action initializations omitted for brevity
};