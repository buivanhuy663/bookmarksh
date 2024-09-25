#!/bin/bash
currentTime=`date +'[%H:%M:%S](%d/%m/%Y)'`

echo "$currentTime $1"

cd src/bookmark-provider
git add .
git commit -a -m "$currentTime $1"
if [ "$2" == "push" ]; then
    git push
	echo "Pushing to remote"
fi

cd -
git add .
git commit -a -m "$currentTime $1"
if [ "$2" == "push" ]; then
    git push
	echo "Pushing to remote"
fi

