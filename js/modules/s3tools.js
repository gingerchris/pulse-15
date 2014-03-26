define(function(){
  return new S3ToolsClass();
});

function S3ToolsClass() {
  var _handle_progress = null;
  var _handle_success  = null;
  var _handle_error    = null;
  var _file_name       = null;

  this.uploadFile = function(file, progress, success, error) {
    _handle_progress = progress;
    _handle_success  = success;
    _handle_error    = error;
    _file_name       = file.name;

    var fd = new FormData();
    fd.append('key', "uploads/" + file.name);
    fd.append('AWSAccessKeyId', AWSKeyId);
    fd.append('acl', 'public-read');
    fd.append('policy', policy);
    fd.append('signature', signature);
    fd.append('Content-Type', file.type);
    fd.append("file",file);

    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open('POST', 'https://' + bucketName + '.s3.amazonaws.com/', true); //MUST BE LAST LINE BEFORE YOU SEND
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(fd);
  }

  function uploadProgress(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      _handle_progress(percentComplete);
    }
  }

  function uploadComplete(evt) {
    if (evt.target.responseText == "") {
      _handle_success(_file_name);
    } else {
      _handle_error(evt.target.responseText);
    }
  }

  function uploadFailed(evt) {
    _handle_error("There was an error attempting to upload the file." + evt);
  }

  function uploadCanceled(evt) {
    _handle_error("The upload has been canceled by the user or the browser dropped the connection.");
  }
}