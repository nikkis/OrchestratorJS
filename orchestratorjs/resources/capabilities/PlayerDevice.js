module.exports = {

    // starts to preload file from uri so that playing can start immediately
    preloadFileFromURI: function (soundFileURI, forceReload) {},
    
    playFileFromURI: function (soundFileURI, async) {},

    stopPlay: function () {},

    // sets the volume level of the phone speaker
    // volumeLevel parameter should be between 1 to 10
    setVolume: function (volumeLevel) {},
    
    // sets the the player into looping mode
    setLoopPlayback: function (loopPlayback) {},
        
    // show url image
    showUrlPhoto: function(photo_url) {},
      
};