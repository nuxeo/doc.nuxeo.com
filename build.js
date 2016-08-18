'use strict';

/* eslint-env es6 */

// Assume production if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Set Debugging up
if (!process.env.DEBUG) {
    process.env.DEBUG = '*:info,*:error';
}

// Debugging
var debug_lib = require('debug');
var debug = debug_lib('nuxeo-build-all');
var info = debug_lib('nuxeo-build-all:info');
var error = debug_lib('nuxeo-build-all:error');

// npm packages
var Promise = require('bluebird');
var co = require('co');
var exec = Promise.promisify(require('child_process').exec);
var yaml_config = require('node-yaml-config');
var path = require('path');
var extend = require('lodash.defaultsdeep');

// local packages
var builder_lib = require('./lib/builder_module');
var pre_builder = builder_lib.pre_builder;
var builder = builder_lib.builder;

var metadata = {};

// helper functions
var run_command = function (command) {
    debug(command);
    return exec(command);
};
var debug_results = function (results) {
    results.forEach(function (result) {
        debug(result);
    });
};

var get_repo_branches = function (config) {
    var repo_branches = [];
    Object.keys(config.repositories).forEach(function (repo_id) {
        var repo = config.repositories[repo_id];
        var target_base = './temp/';
        repo.branches.forEach(function (branch) {
            info('Adding - repo: %s, branch: %s', repo_id, branch);
            repo_branches.push({
                target_source_path: target_base + '/' + repo_id + '/' + branch + '/src/',
                target_build_path : target_base + '/' + repo_id + '/' + branch + '/site/',
                repo_id           : repo_id,
                branch            : branch
            });
        });
    });
    return repo_branches;
};


var config = yaml_config.load(path.join(__dirname, './config.yml'));
var branches = get_repo_branches(config);
debug('branches: %o', branches);

co(function *() {
    // initalise repositories
    var commands = [];
    Object.keys(config.repositories).forEach(function (repo_id) {
        info('Getting latest content - repo: %s', repo_id);
        var repo = config.repositories[repo_id];
        commands.push(run_command('./scripts/initialise_repo.sh ' + repo_id + ' "' + repo.url + '"'));
    });
    var results = yield commands;
    debug_results(results);

    // Copy Branches
    var pre_build = [];
    for (var i = 0; i < branches.length; i++) {
        info('Copying - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        yield run_command('./scripts/copy_branch.sh ' + branches[i].repo_id + ' ' + branches[i].branch);
        info('Preparing Pre-Build - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        pre_build.push(pre_builder(branches[i].target_source_path));
    }
    // Pre-build
    var pre_build_result = yield pre_build;
    pre_build_result.forEach(function (data) {
        extend(metadata, data);
    });
    debug(metadata);

    var build = [];
    for (i = 0; i < branches.length; i++) {
        info('Preparing Build - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        build.push(builder(branches[i].target_source_path, metadata, branches[i].target_build_path));
        // yield builder(branches[i].target_source_path, metadata, branches[i].target_build_path);
    }
    yield build;

    for (i = 0; i < branches.length; i++) {
        info('Copying Site - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        yield run_command('./scripts/copy_site.sh ' + branches[i].repo_id + ' ' + branches[i].branch);
    }

}).catch(function (err) {
    error(err);
    throw err;
});
