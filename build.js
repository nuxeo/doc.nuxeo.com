'use strict';

// var debug_lib   = require('debug');
// var debug       = debug_lib('nuxeo-build');
// var error       = debug_lib('nuxeo-build:error');
var path        = require('path');
var yaml_config = require('node-yaml-config');
var builder     = require('./lib/builder');

// /*"nuxeo-docs": "git@github.com:nuxeo/doc.nuxeo.com.git#separate-content"*/
// git lfs clone git@github.com:nuxeo/doc.nuxeo.com.git modules/nuxeo-docs && pushd $_ && git checkout -f separate-content && npm install && popd
// pushd modules/nuxeo-docs && git pull && npm install && popd

var target_repo_path = __dirname;
var config = yaml_config.load(path.join(target_repo_path, '/config.yml')) || {};

builder(config, target_repo_path + '/src', path.join(__dirname, 'site'));
