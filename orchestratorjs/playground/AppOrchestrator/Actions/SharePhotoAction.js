var Action = function (name) {
    this.name = name;
};


module.exports = function constructAction(App) {

    var that = new Action('PhotoShareAction');

    that.name = 'PhotoShareAction';

    var roles = {
        source: null,
        sinks: null
    };

    that.casting = function (Event) {
        roles.source = Event.sender;
        roles.sinks = App.devices
            .hasCapability('PhotoSharing')
            .isInState('PhotoSharing.isReadyToView')
            .notEquals([roles.source]);
        return roles;
    };


    that.guard = function (roles) {
        return (App.currentPhoto &&
            forAll(roles.sinks, sink.photoSharing.isReadyToView));
    };


    that.body = function (roles) {

        roles.source.photoSharing.setCurrentPhoto(App.state.currentPhoto);
        var i;
        for (i = 0; i < roles.sinks.length; i += 1) {

            roles.sinks[i].photoSharing.setCurrentPhoto(App.state.currentPhoto);

        }

        App.currentPhoto = null;

    };

    return that;
};