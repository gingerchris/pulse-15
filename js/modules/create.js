define(['underscore'], function() {

    var audio = {
        file : 0,
        input : document.getElementById('audioInput'),
        validate : function(input){
            audio.file = input.files[0];
            if(audio.file && audio.file.type == "audio/mp3"){
                return true;
            }else{
                return false;
            }
        },
        process : function(file){
            //upload.send(file, audio.success, audio.fail);
            var reader = new FileReader();
            reader.readAsDataURL(audio.file);
            reader.onload = function(e){
                require(['modules/av'],function(av){
                    av.createAudio(e.target.result);

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
                });
            }
        },
        success : function(file){
            //the audio successfully uploaded so is ready for processing
        },
        fail : function(){
            //retry the upload dependent on error message
        }
    }

    var image = {
        foreground : 0,
        background : 0,
        fgInput : document.getElementById('fgInput'),
        bgInput : document.getElementById('bgInput'),
        fileTypes : ["image/jpg","image/jpeg","image/gif","image/png"],
        validate : function(input){
            var type = input.getAttribute('name');
            image[type] = input.files[0];
            if(image[type] && (_.indexOf(image.fileTypes,image[type].type) >= 0)){
                return true;
            }else{
                return false;
            }
        },
        setForeground : function(file){
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e){
                require(['modules/av'],function(av){
                    av.addForeground('createForeground');
                    av.setForeground(e.target.result);
                });
            };

        },
        setBackground : function(file){
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e){
                require(['modules/av'],function(av){
                    av.addBackground('createBackground');
                    av.setBackground('url('+e.target.result+')');
                });
            };
        }
    }

    var upload = {
        template : _.template("<div id='upload-progress'><div id='upload-status'>Uploading: <%= filename %></div><div id='upload-progress-indicator' style='width:0'></div></div>"),
        send : function(file,success,fail){
            //insert progress bar
            document.getElementById('status').innerHTML = upload.template({filename : file.name});

            upload.progress = document.getElementById('upload-progress-indicator');
            upload.progressContainer = document.getElementById('upload-progress');
            upload.statusT = document.getElementById('upload-status');

            require(['modules/s3tools'],function(s3){
              s3.uploadFile(file, upload.handleProgress, function(){
                    upload.handleSuccess();
                    if(typeof(success) === "function"){
                        success();
                    }
                }, function(){
                    upload.handleError();
                    if(typeof(fail) === "function"){
                        fail();
                    }
                });
            });

        },
        handleProgress : function(percentComplete) {
            upload.progress.style['width'] = percentComplete.toString() + '%';
        },
        handleSuccess : function(fileName) {
            upload.statusT.innerHTML = 'Done!';
        },
        handleError : function(message) {
            upload.statusT.innerHTML = 'Error: ' + message;
        }
    }

    return {
        initAudio : function(){

            //bind to audio input
            audio.input.addEventListener('change',function(){
              if(audio.validate(this)){
                //file type is good - begin processing
                audio.process(audio.file);
              }else{
                //invalid file type - show error and reset input
              }
            }, false);

        },

        initImages : function(){

            //bind to image inputs
            image.fgInput.addEventListener('change',function(){
                if(image.validate(this)){
                    //image is good - put it in place and upload
                    image.setForeground(image.fgInput.files[0]);
                }else{
                    //invalid file type
                }
            },false);

            image.bgInput.addEventListener('change',function(){
                if(image.validate(this)){
                    //image is good - put it in place and upload
                    image.setBackground(image.bgInput.files[0]);
                }else{
                    //invalid file type
                }
            },false);

        }
    };


});