<?php

/*
 * Calculate HMAC-SHA1 according to RFC2104
 * See http://www.faqs.org/rfcs/rfc2104.html
 */
function hmacsha1($key,$data) {
    $blocksize=64;
    $hashfunc='sha1';
    if (strlen($key)>$blocksize)
        $key=pack('H*', $hashfunc($key));
    $key=str_pad($key,$blocksize,chr(0x00));
    $ipad=str_repeat(chr(0x36),$blocksize);
    $opad=str_repeat(chr(0x5c),$blocksize);
    $hmac = pack(
                'H*',$hashfunc(
                    ($key^$opad).pack(
                        'H*',$hashfunc(
                            ($key^$ipad).$data
                        )
                    )
                )
            );
    return bin2hex($hmac);
}

/*
 * Used to encode a field for Amazon Auth
 * (taken from the Amazon S3 PHP example library)
 */
function hex2b64($str)
{
    $raw = '';
    for ($i=0; $i < strlen($str); $i+=2)
    {
        $raw .= chr(hexdec(substr($str, $i, 2)));
    }
    return base64_encode($raw);
}

/* Create the Amazon S3 Policy that needs to be signed */
$policy = '{"expiration": "2020-01-01T00:00:00Z",
  "conditions": [
    {"bucket": "pulse-15"},
    ["starts-with", "$key", "uploads/"],
    {"acl": "public-read"},
    ["starts-with", "$Content-Type", ""],
    ["content-length-range", 0, 1048576]
  ]
}';

/*
 * Base64 encode the Policy Document and then
 * create HMAC SHA-1 signature of the base64 encoded policy
 * using the secret key. Finally, encode it for Amazon Authentication.
 */
$secretkey = "";

$base64_policy = base64_encode($policy);
$signature = hex2b64(hmacsha1($secretkey, $base64_policy));

$v['policy'] = $base64_policy;
$v['signature'] = $signature

?>

<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <style>
            body {
                padding-top: 50px;
                padding-bottom: 20px;
            }
        </style>
        <link rel="stylesheet" href="stylesheets/styles.css">

        <script src="js/vendor/modernizr-2.6.2-respond-1.1.0.min.js"></script>
    </head>
    <body>
            <div id="status"></div>

            <div id="audio-upload" class="create upload--audio">
                <input type="file" id="audioInput" accept="audio/mp3" />
                <div>
                    <p>Drop an MP3 here or click to choose a file.</p>
                </div>
            </div>

            <div id="audio-trim" class="create hide">

            </div>

            <div id="bg-upload" class="create hide upload--image">
                <input type="file" id="bgInput" name="background" accept="image/*" />
                <div>
                    <p>Drop an image here for your background, or click to choose one.</p>
                    <p>It can be a JPG, PNG or GIF but make it 640 x 640px</p>
                </div>
            </div>

            <div id="fg-upload" class="create hide upload--image">
                <input type="file" id="fgInput" name="foreground" accept="image/*" />
                <div>
                    <p>Drop an image here for your foreground, or click to choose one.</p>
                    <p>For best results, make it a PNG with a transparent background, 640 x 640px</p>
                    <p class="small">A JPG or GIF would work too, but won't look as good</p>
                </div>
            </div>

            <div id="create-finalise" class="create hide">

                <div class="bg" id="createBackground">
                  <img src="" class="fg" id="createForeground" />
                </div>

                <input id="intensity" type="range" min="0" max="100" />

                <div id="playtrack"><div id="playhead"></div></div>

                <a href="#" id="pause">Pause</a>
                <a href="#" id="play">Play</a>

            </div>

    </div> <!-- /container -->
        <script>
            var bucketName = 'pulse-15';
            var AWSKeyId   = 'AKIAILY726BNRCXSRMOQ';
            <?php foreach($v as $k=>$i){
                echo "var $k = '$i';";
            }?>
        </script>
        <script src="bower_components/requirejs/require.js" data-main="js/config"></script>

        <script>
            var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
            (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src='//www.google-analytics.com/ga.js';
            s.parentNode.insertBefore(g,s)}(document,'script'));
        </script>
    </body>
</html>
