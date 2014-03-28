#retrieve files from s3 bucket
s3cmd get s3://pulse-15/$1 $4.$1
s3cmd get s3://pulse-15/$2 $4.$2
s3cmd get s3://pulse-15/$3 $4.$3