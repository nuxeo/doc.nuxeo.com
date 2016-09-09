#!/bin/bash
mkdir -p ./site ./temp;

BUILD_REPOS=./temp/build_repos.txt;
./bin/build-repos > $BUILD_REPOS;

BUILD_PATHS=./temp/build_paths.txt;
./bin/build-paths > $BUILD_PATHS;

# Scripts
INITIALISE_REPO=./scripts/initialise_repo.sh;
COPY_BRANCH=./scripts/copy_branch.sh;
BUILD_SITE="node build.js";
COPY_SITE=./scripts/copy_site.sh;


echo "Checking Repositories";
cat $BUILD_REPOS | while read line ; do $INITIALISE_REPO $line; done;

echo;
echo "Copying Branches Before Building";
cat $BUILD_PATHS | while read line ; do $COPY_BRANCH $line; done;

echo;
echo "Run Pre-build For All Branches";
node pre_build.js;

echo;
echo "Building Sites";
cat $BUILD_PATHS | while read line ; do $BUILD_SITE $line; done;

echo;
echo "Copying To Site After Builds";
cat $BUILD_PATHS | while read line ; do $COPY_SITE $line; done;

echo;
echo "Creating sitemap index";
./bin/create-sitemap-index;

echo;
echo "Complete";
