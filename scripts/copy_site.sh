#!/bin/bash

REPO_ID="${1}";
BRANCH="${2}";

SOURCE_ASSETS="./temp/${REPO_ID}/$BRANCH/assets"; # No trailing slash to copy the dir name over
SOURCE_SITE="./temp/${REPO_ID}/$BRANCH/site/";
TARGET_BASE=./site/;

# master and static use root
if [ $BRANCH = 'master' ] || [ $BRANCH = 'static' ] ; then
    TARGET_BASE_ASSETS="${TARGET_BASE}";
else
    # main version branch, include version for assets
    SOURCE_ASSETS="./temp/${REPO_ID}/$BRANCH/assets/";
    TARGET_BASE_ASSETS="${TARGET_BASE}assets/";
fi

if [ -d $SOURCE_SITE -a ! -L $SOURCE_SITE ]; then
    mkdir -p $TARGET_BASE;
    rsync -a $SOURCE_SITE $TARGET_BASE;
    mkdir -p $TARGET_BASE_ASSETS;
    rsync -a --ignore-existing $SOURCE_ASSETS $TARGET_BASE_ASSETS;
else
    exit 1;
fi
