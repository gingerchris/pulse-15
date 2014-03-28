#!/bin/bash
#
# v3 - use imagemagick persistent cache file format for quicker processing
#
# generate a video based on sound and two image files
# arguments are AUDIO FILE, FOREGROUND IMAGE, BACKGROUND IMAGE, OUTPUT FILENAME


if [ $# -lt "5" ]
then
  echo "This script needs at least 5 arguments - audio_file foreground_image background_image output_filename movement_intensity"
  exit 0
fi

STARTTIME=$(date +%s)

#retrieve files from s3 bucket
echo -e "\e[7mRetrieving Files\e[27m"
bash bash/retrieve.sh $1 $2 $3 $4 $5

#generate mono audio file and waveform
echo -e "\e[7mGenerating waveform\e[27m"
bash bash/waveform.sh $1 $2 $3 $4 $5

#generate all the frames
echo -e "\e[7mGenerating video sequence\e[27m"
bash bash/genframes.sh $1 $2 $3 $4 $5

#compile to video and cleanup
echo -e "\e[7mCompiling and cleaning up\e[27m"
bash bash/finalise.sh $1 $2 $3 $4 $5

echo -e "\e[7mOutput file: $4.mp4\e[27m"

ENDTIME=$(date +%s)
echo -e "\e[7mTime Taken : ($(($ENDTIME - $STARTTIME))s)\e[27m"