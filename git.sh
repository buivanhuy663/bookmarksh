#!/bin/bash

if [ "$1" == "commit" ]; then

currentTime=`date +'[%H:%M:%S](%d/%m/%Y)'`

echo "$currentTime $1"

cd src/bookmark-provider
git add .
git commit -a -m "$currentTime $2"
if [ "$3" == "p" ]; then
    git push
	echo "Pushing to remote"
fi

cd -
git add .
git commit -a -m "$currentTime $2"
if [ "$3" == "p" ]; then
    git push
	echo "Pushing to remote"
fi

fi


if [ "$1" == "pull" ]; then
cd src/bookmark-provider
git pull

cd -
git pull
fi

