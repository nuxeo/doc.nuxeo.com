#!/bin/bash

REPO_BASE=./repositories/;
REPO_ID="${1}";
REPO_URL="${2}";
REPO_DIR="./${REPO_ID}/";

if [ -d $REPO_BASE -a ! -L $REPO_BASE ]; then
    echo "${REPO_BASE} exists.";
else
    mkdir -p $REPO_BASE;
fi

cd $REPO_BASE;

if [ -d $REPO_DIR -a ! -L $REPO_DIR ]; then
    echo "${REPO_DIR} exists.";
    cd $REPO_DIR && \
    git reset --hard && \
    git fetch --all && \
    git lfs fetch --recent;
else
    git clone --depth=1 --no-single-branch $REPO_URL $REPO_ID && \
    cd $REPO_DIR && \
    git install && \
    git fetch --recent && \
    git reset --hard;
fi
