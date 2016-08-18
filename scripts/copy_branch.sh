#!/bin/bash

REPO_BASE=./repositories/;
REPO_ID="${1}";
BRANCH="${2}";
REPO_DIR="${REPO_BASE}${REPO_ID}/";
TARGET_DIR="./temp/${REPO_ID}/$BRANCH/";

if [ -d $REPO_DIR -a ! -L $REPO_DIR ]; then
    pushd $REPO_DIR;
    git checkout -f origin/$BRANCH;
    popd;
    mkdir -p $TARGET_DIR;
    rsync -av --exclude=".*" $REPO_DIR $TARGET_DIR;
else
    exit 1;
fi
