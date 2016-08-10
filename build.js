'use strict';

// var debug_lib   = require('debug');
// var debug       = debug_lib('nuxeo-build');
// var error       = debug_lib('nuxeo-build:error');
var path        = require('path');
var yaml_config = require('node-yaml-config');
var builder     = require('./lib/builder');


// var target_repo_path = __dirname;
// var target_repo_path = '../doc.nuxeo.com-platform-spaces';
var target_repo_path = '../doc.nuxeo.com-static-spaces';
var config = yaml_config.load(path.join(target_repo_path, '/config.yml')) || {};

builder(config, target_repo_path + '/src', path.join(__dirname, 'site'));
