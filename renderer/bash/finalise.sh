ffmpeg -r 30 -i frames-$4/%04d.png -i $4.$1 -c:v libx264 -r 30 -pix_fmt yuv420p $4.mp4

s3cmd put $4.mp4 s3://pulse-15/$4.mp4


rm -f $4.mp4
rm -f $4.$1.json
rm -f $4.$1.json-e
rm -f fg-$4.mpc
rm -f fg-$4.cache
rm -f bg-$4.mpc
rm -f bg-$4.cache
rm -f -rf frames-$4
rm -f -rf framescache-$4
rm -f $4.$1
rm -f $4.$2
rm -f $4.$3