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
$secretkey = "RR1r4KJODSI4uG5VoAFhFtB8uGdKH8lc7UoeVBer";

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

        <link rel="stylesheet" href="css/bootstrap.min.css">
        <style>
            body {
                padding-top: 50px;
                padding-bottom: 20px;
            }
        </style>
        <link rel="stylesheet" href="css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="css/main.css">

        <script src="js/vendor/modernizr-2.6.2-respond-1.1.0.min.js"></script>
    </head>
    <body>
        <div id="status"></div>
        <div id="create">

            <div id="bg-upload" class="upload upload--image">
                Background Image:<input type="file" id="bgInput" name="background" />
            </div>

            <div id="fg-upload" class="upload upload--image">
                Foreground Image:<input type="file" id="fgInput" name="foreground" />
            </div>

            <div id="audio-upload" class="upload upload--audio">
                Audio File:<input type="file" id="audioInput" />
            </div>

            <div id="playtrack"><div id="playhead"></div></div>

            <a href="#" id="pause">Pause</a>
            <a href="#" id="play">Play</a>

        </div>

        <div id="view">

            <div class="bg" id="createBackground">
              <img src="" class="fg" id="createForeground" />
            </div>

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
