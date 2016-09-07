'use strict';
/* eslint-env es6 */
/* eslint no-console: 0 */

// Assume production if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Set Debugging up
if (!process.env.DEBUG) {
    process.env.DEBUG = '*:info,*:error';
}

// Debugging
const {debug, info, error} = require('./modules/debugger')('nuxeo-pre-build');

// npm packages
const Promise = require('bluebird');
const co = require('co');
const extend = require('lodash.defaultsdeep');
const fs = require('fs');
const path = require('path');
const yaml_config = require('node-yaml-config');

// Promisified
const writeFile = Promise.promisify(fs.writeFile);

// local packages
const pre_builder = require('./lib/pre_builder');


const metadata = {};

const get_repo_branches = function (config) {
    const repo_branches = [];
    Object.keys(config.repositories).forEach(function (repo_id) {
        const repo = config.repositories[repo_id];
        const target_base = path.join(__dirname, 'temp');
        repo.branches.forEach(function (branch) {
            info('Adding - repo: %s, branch: %s', repo_id, branch);
            repo_branches.push({
                target_source_path: path.join(target_base, repo_id, branch, 'src'),
                target_build_path : path.join(target_base, repo_id, branch, 'site'),
                repo_id           : repo_id,
                branch            : branch
            });
        });
    });
    return repo_branches;
};


const config = yaml_config.load(path.join(__dirname, 'config.yml'));
const branches = get_repo_branches(config);
debug('branches: %o', branches);

co(function *() {
    console.time('Pre-Build');

    // Copy Branches
    const pre_build = [];
    for (let i = 0; i < branches.length; i++) {
        info('Preparing Pre-Build - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        pre_build.push(pre_builder(branches[i].target_source_path));
    }
    // Pre-build
    // console.time('prebuild');
    const pre_build_result = yield pre_build;
    // console.timeEnd('prebuild');
    pre_build_result.forEach(function (data) {
        extend(metadata, data);
    });
    debug('metadata keys: %o', Object.keys(metadata));

    writeFile(path.join(__dirname, 'temp/metadata.json'), JSON.stringify(metadata))
    .then(() => info('Created `temp/metadata.json`'))
    .catch(err => {
        error('There was an issue creating `temp/metadata.json`');
        throw err;
    });

    // Create Flat JSON list of files and assets
    var flat_json = Object.keys(metadata.pages).filter(page_path => !metadata.pages[page_path].is_redirect).map(page_path => metadata.pages[page_path]);
    flat_json = flat_json.concat(Object.keys(metadata.assets).map(asset_path => metadata.assets[asset_path]));

    writeFile(path.join(__dirname, 'editor.json'), JSON.stringify(flat_json))
    .then(() => info('Created `editor.json`'))
    .catch(err => {
        error('There was an issue creating `editor.json`');
        throw err;
    });

    console.timeEnd('Pre-Build');

}).catch(function (err) {
    error(err);
    throw err;
});
