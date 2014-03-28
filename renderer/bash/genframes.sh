mkdir -p "frames-$4"
mkdir -p "framescache-$4"
frames=( $( cat $4.$1.json ) )

prevScale=100

gm convert $4.$2 fg-$4.png
gm convert $4.$3 bg-$4.png
for i in "${!frames[@]}"
do :
	key=$(printf %04d $f)
	val=${frames[$i]}
	if [[ $val =~ .*e.* ]]
	then
		n=(${val//e/ })
		scale=$(echo "${n[0]}*10^${n[1]}" | bc -l)
	else
		scale=$val
	fi
	scale=$(printf %.2f $scale)
	diff=$(echo "($prevScale-$scale)" | bc -l)
	prevScale=$scale

	pos=$(echo "$diff>0.05" | bc)
	neg=$(echo "$diff<-0.05" | bc)
	if [[ "$pos" == 1 ]] || [[ "$neg" == 1 ]]; then
		scale=$(echo "($scale*$5)+80" | bc -l)
        if [[ -f "framescache-$4/$scale.png" ]]; then
            cp framescache-$4/$scale.png frames-$4/$key.png
        else
            gm convert fg-$4.png -scale $scale% -gravity Center -crop 640x640+0+0 +repage frames-$4/$key.png
            gm composite -gravity center frames-$4/$key.png bg-$4.png frames-$4/$key.png
            cp frames-$4/$key.png framescache-$4/$scale.png
        fi
	else
		prev=$(echo "$key-1" | bc -l)
		prev=$(printf %04d $prev)
		cp frames-$4/$prev.png frames-$4/$key.png
	fi
    (( f++ ))
done