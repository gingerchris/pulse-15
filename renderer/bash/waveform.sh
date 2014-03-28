sox -V0 -r 8000 -c 1 $4.$1 $4.$1.mono.wav

duration=( $( soxi -D $4.$1 ) )
frameCount=$(echo "$duration*30" | bc -l)
frameCount=${frameCount%.*}

waveformjson $4.$1.mono.wav -q -m peak -W $frameCount --force $4.$1.json
rm $4.$1.mono.wav

sed -i -e 's/\[//g;s/\]//g;s/,//g' $4.$1.json