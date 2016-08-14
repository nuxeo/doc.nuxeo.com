#!/bin/bash

REPO_ID="${1}";
BRANCH="${2}";
SOURCE_ASSETS="./temp/${REPO_ID}/$BRANCH/assets"; # No triling slash to copy the dir name over
SOURCE_SITE="./temp/${REPO_ID}/$BRANCH/site/";
TARGET_BASE=./site/;

if [ -d $SOURCE_SITE -a ! -L $SOURCE_SITE ]; then
    mkdir -p $TARGET_BASE;
    rsync -av $SOURCE_SITE $TARGET_BASE;
    rsync -av $SOURCE_ASSETS $TARGET_BASE;
else
    exit 1;
fi
