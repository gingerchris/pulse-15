require.config({
  paths: {
      underscore: "../bower_components/underscore/underscore",
  },
  shim: {
    underscore: {
      exports: '_'
    }
  }
});

window.AudioContext = window.AudioContext||window.webkitAudioContext;

require(['modules/create'],function(create){
  create.initAudio();
  create.initImages();
})
