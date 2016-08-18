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
    cd $REPO_DIR && \
    git fetch --all && \
    git lfs pull;
else
    git lfs clone $REPO_URL $REPO_ID && \
    cd $REPO_DIR && \
    git lfs install && \
    git reset --hard;
fi
