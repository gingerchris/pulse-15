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
        drag : {
            x : 0,
            y : 0
        },
        fgPos : {
            x : 0,
            y : 0
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
            av.foreground.style.webkitTransform = 'scale(' + (0.9+rms) + ')';
            av.foreground.style.MozTransform = 'scale(' + (0.9+rms) + ')';
            av.foreground.style.msTransform = 'scale(' + (0.9+rms) + ')';
            av.foreground.style.OTransform = 'scale(' + (0.9+rms) + ')';
            av.foreground.style.transform = 'scale(' + (0.9+rms) + ')';
        },
        createAudio : function(file){
            var ctx = new window.AudioContext()
              // 2048 sample buffer, 1 channel in, 1 channel out
              , processor = ctx.createJavaScriptNode(2048, 1, 1);

            av.audio = new Audio(file);

            //update playhead position based on time.
            av.audio.addEventListener('timeupdate',function(){
              playhead.style['width'] = ((this.currentTime/av.duration) * 100) + "%";
            },false);


            //set up playhead skipping from the playtrack
            console.log(av.playhead);
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

              av.audio.play();
            }, false);


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
                  av.manipulateForeground(rms);
                  oldRMS = rms;
              }
            }
        }
    };
    return av;

});