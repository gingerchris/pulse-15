define(['underscore'], function() {
    var oldRMS = 0;
    var minDiff = 0.03;

    var av = {
        audio : 0,
        source : 0,
        wfrac : 0,
        duration : 0,
        playhead : document.getElementById('playhead'),
        playtrack : document.getElementById('playtrack'),
        foreground : 0,
        background : 0,
        intensity : 0.5,
        sensitivity : 0.05,
        loop : 0,
        drag : {
            x : 0,
            y : 0
        },
        fgPos : {
            x : 0,
            y : 0
        },
        init : function(){
          var pause = document.getElementById('pause');
          pause.addEventListener("click",function(evt){
            av.audio.pause();
            evt.preventDefault();
          },false);

          var play = document.getElementById('play');
          play.addEventListener("click",function(evt){
            av.audio.play();
            evt.preventDefault();
          },false);

          var intensity = document.getElementById('intensity');
          intensity.addEventListener("change",function(evt){
              av.intensity = evt.srcElement.value/100;
          });

          var sensitivity = document.getElementById('sensitivity');
          sensitivity.addEventListener("change",function(evt){
              av.sensitivity = evt.srcElement.value/-1000;
          });
        },
        addForeground : function(id){
            av.foreground = document.getElementById(id);
        },
        addBackground : function(id){
            av.background = document.getElementById(id);
        },
        setForeground : function(file){
            av.foreground.setAttribute('src',file);
            av.foreground.setAttribute("draggable",true);
            av.foreground.addEventListener("dragstart",function(e){
                av.drag.l = e.offsetX;
                av.drag.t = e.offsetY;
            },false)
            av.foreground.addEventListener("dragend",function(e){
                av.moveForeground(e);
            },false)
        },
        setBackground : function(file){
            av.background.style['background-image'] = file;
        },
        moveForeground : function(e){
            var left = e.pageX - av.foreground.parentNode.offsetLeft - av.drag.x;
            av.fgPos.x = left;
            av.foreground.style['margin-left'] = left+'px';

            var top = e.pageY - av.foreground.parentNode.offsetTop - av.drag.y;
            av.fgPos.y = top;
            av.foreground.style['margin-top'] = top+'px';
        },
        manipulateForeground : function(rms){
          if(av.foreground !== 0){
            av.foreground.style.webkitTransform = 'scale(' + (0.9+(rms*av.intensity)) + ')';
            av.foreground.style.MozTransform = 'scale(' + (0.9+(rms*av.intensity)) + ')';
            av.foreground.style.msTransform = 'scale(' + (0.9+(rms*av.intensity)) + ')';
            av.foreground.style.OTransform = 'scale(' + (0.9+(rms*av.intensity)) + ')';
            av.foreground.style.transform = 'scale(' + (0.9+(rms*av.intensity)) + ')';
          }
        },
        createAudio : function(file,loop){
            var ctx = new window.AudioContext()
              // 2048 sample buffer, 1 channel in, 1 channel out
              , processor = ctx.createJavaScriptNode(2048, 1, 1);

            av.audio = new Audio(file);

            //update playhead position based on time.
            av.audio.addEventListener('timeupdate',function(){
              playhead.style['width'] = ((this.currentTime/av.duration) * 100) + "%";
            },false);


            //set up playhead skipping from the playtrack
            av.playtrack.addEventListener("click",function(evt){
              var x = evt.pageX - this.offsetLeft;
              var p = (x/this.offsetWidth)*100;
              av.playhead.style['width'] = p+'%';
              av.audio.currentTime = p * av.wfrac;
            },false);


            av.audio.addEventListener('canplaythrough', function(){
              av.source = ctx.createMediaElementSource(av.audio);
              av.duration = av.source.mediaElement.duration;
              av.wfrac = av.duration / 100;
              av.source.connect(processor);
              av.source.connect(ctx.destination);
              processor.connect(ctx.destination);

            }, false);

            if(loop === true){
              av.audio.addEventListener('ended',function(){
                av.audio.play();
              })
            }

            av.audio.play();


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
              if(diff > av.sensitivity || diff < (av.sensitivity * -1)){
                  av.manipulateForeground(rms);
                  oldRMS = rms;
              }
            }
        }
    };
    return av;

});