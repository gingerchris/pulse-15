var oldRMS = 0;
var minDiff = 0.03;
var audio, 
    source,
    wfrac,
    duration,
    playhead = document.getElementById('playhead'),
    foreground = document.getElementById('foreground'),
    background = document.getElementById('background');

window.AudioContext = window.AudioContext||window.webkitAudioContext;

function manipulateForeground(rms){
    foreground.style.webkitTransform = 'scale(' + (0.9+rms) + ')';
    foreground.style.MozTransform = 'scale(' + (0.9+rms) + ')';
    foreground.style.msTransform = 'scale(' + (0.9+rms) + ')';
    foreground.style.OTransform = 'scale(' + (0.9+rms) + ')';
    foreground.style.transform = 'scale(' + (0.9+rms) + ')';
}

function createAudio(file){

  var ctx = new AudioContext()
    // 2048 sample buffer, 1 channel in, 1 channel out
    , processor = ctx.createJavaScriptNode(2048, 1, 1);
    
  audio = new Audio(file);

  audio.addEventListener('timeupdate',function(){
    playhead.style['width'] = ((this.currentTime/duration) * 100) + "%";
  },false);

  audio.addEventListener('canplaythrough', function(){
    source = ctx.createMediaElementSource(audio);
    duration = source.mediaElement.duration;
    wfrac = duration / 100;
    source.connect(processor);
    source.connect(ctx.destination);
    processor.connect(ctx.destination);
  }, false);

  waveform = [];

  // loop through PCM data and calculate average
  // volume for a given 2048 sample buffer
  processor.onaudioprocess = function(evt){
    var input = evt.inputBuffer.getChannelData(0)
      , len = input.length
      , total = i = 0
      , rms
    while ( i < len ) total += Math.abs( input[i++] )
    rms = Math.sqrt( total / len );
    var diff = (oldRMS - rms);
    if(diff > minDiff || diff < (minDiff * -1)){
        manipulateForeground(rms);
        oldRMS = rms;
        waveform.push(rms);
    }
    //console.log(rms);
  }

}

function showImgUpload(input, callback){
  if(input.files && input.files[0]){
      var reader = new FileReader();
      reader.onload = function (e)
      {
          var image = new Image();
          image.src = e.target.result;

          image.onload = function() {
              // access image size here
              callback(e.target.result);
          };


      };
      reader.readAsDataURL(input.files[0]);
  }
}

function showAudioUpload(input, callback){
  if(input.files && input.files[0]){
      var reader = new FileReader();
      reader.onload = function (e)
      {
          createAudio(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
  }
}

var playtrack = document.getElementById('playtrack');
playtrack.addEventListener("click",function(evt){
  var x = evt.pageX - this.offsetLeft;
  var p = (x/this.offsetWidth)*100;
  playhead.style['width'] = p+'%';
  audio.currentTime = p * wfrac;
},false);

var pause = document.getElementById('pause');
pause.addEventListener("click",function(evt){
  audio.pause();
  evt.preventDefault();
},false);

var play = document.getElementById('play');
play.addEventListener("click",function(evt){
  audio.play();
  evt.preventDefault();
},false);

var bg = document.getElementById('bg-img');
bg.addEventListener('change',function(){
  showImgUpload(bg,function(img){
    background.style['background-image'] =  "url("+img+")";
  })
}, false);

var fg = document.getElementById('fg-img');
fg.addEventListener('change',function(){
  showImgUpload(fg,function(img){
    foreground.setAttribute('src',img);
  })
}, false);

var au = document.getElementById('audio');
au.addEventListener('change',function(){
  showAudioUpload(au,function(au){
  })
}, false);