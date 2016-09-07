#!/bin/bash

REPO_BASE=./repositories/;
REPO_ID="${1}";
BRANCH="${2}";
REPO_DIR="${REPO_BASE}${REPO_ID}/";
TARGET_DIR="./temp/${REPO_ID}/$BRANCH/";

if [ -d $REPO_DIR -a ! -L $REPO_DIR ]; then
    echo "Preparing: ${REPO_ID} - ${BRANCH}";
    pushd $REPO_DIR;
    git checkout -f origin/$BRANCH;
    popd;
    mkdir -p $TARGET_DIR;
    rsync -a --exclude=".*" $REPO_DIR $TARGET_DIR;
else
    echo "Failed to find: ${REPO_ID} - ${BRANCH}";
    exit 1;
fi
