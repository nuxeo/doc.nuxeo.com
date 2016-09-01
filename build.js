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
const debug_lib = require('debug');
const debug = debug_lib('nuxeo-build-all');
const info = debug_lib('nuxeo-build-all:info');
const error = debug_lib('nuxeo-build-all:error');

// npm packages
const Promise = require('bluebird');
const co = require('co');
const extend = require('lodash.defaultsdeep');
const fs = require('fs');
const multimatch = require('multimatch');
const path = require('path');
const sitemap = require('sitemap');
const yaml_config = require('node-yaml-config');

// Promisified
const exec = Promise.promisify(require('child_process').exec);
const readdir = Promise.promisify(fs.readdir);
const writeFile = Promise.promisify(fs.writeFile);


// local packages
const builder_lib = require('./lib/builder_module');
const pre_builder = builder_lib.pre_builder;
const builder = builder_lib.builder;

const metadata = {};

const scripts = {
    initialise_repo: path.join(__dirname, 'scripts/initialise_repo.sh'),
    copy_branch    : path.join(__dirname, 'scripts/copy_branch.sh'),
    copy_site      : path.join(__dirname, 'scripts/copy_site.sh')
};

// helper functions
const run_command = function (command) {
    debug(command);
    return exec(command);
};
const debug_results = function (results) {
    results.forEach(function (result) {
        debug(result);
    });
};

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
    console.time('full-build');
    // initalise repositories
    const commands = [];
    Object.keys(config.repositories).forEach(function (repo_id) {
        info('Getting latest content - repo: %s', repo_id);
        const repo = config.repositories[repo_id];

        commands.push(run_command(`${scripts.initialise_repo} ${repo_id} "${repo.url}"`));
    });
    const results = yield commands;
    debug_results(results);

    // Copy Branches
    const pre_build = [];
    for (let i = 0; i < branches.length; i++) {
        info('Copying - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        yield run_command(`${scripts.copy_branch} ${branches[i].repo_id} ${branches[i].branch}`);
        info('Preparing Pre-Build - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        pre_build.push(pre_builder(branches[i].target_source_path));
    }
    // Pre-build
    console.time('prebuild');
    const pre_build_result = yield pre_build;
    console.timeEnd('prebuild');
    pre_build_result.forEach(function (data) {
        extend(metadata, data);
    });
    debug('metadata keys: %o', Object.keys(metadata));

    // Create Flat JSON list of files and assets
    var flat_json = Object.keys(metadata.pages).filter(page_path => !metadata.pages[page_path].is_redirect).map(page_path => metadata.pages[page_path]);
    flat_json = flat_json.concat(Object.keys(metadata.assets).map(asset_path => metadata.assets[asset_path]));

    writeFile(path.join(__dirname, 'editor.json'), JSON.stringify(flat_json))
    .then(() => info('Created `editor.json`'))
    .catch(err => {
        error('There was an issue creating `editor.json`');
        throw err;
    });

    const build = [];
    for (let i = 0; i < branches.length; i++) {
        info('Preparing Build - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        build.push(builder(branches[i].target_source_path, metadata, branches[i].target_build_path, branches[i].repo_id));
        // yield builder(branches[i].target_source_path, metadata, branches[i].target_build_path);
    }
    console.time('build');
    yield build;
    console.timeEnd('build');

    for (let i = 0; i < branches.length; i++) {
        info('Copying Site - repo: %s, branch: %s', branches[i].repo_id, branches[i].branch);
        yield run_command(`${scripts.copy_site} ${branches[i].repo_id} ${branches[i].branch}`);
    }

    // Add sitemap index
    readdir(path.join(__dirname, 'site')).then(
        files => {
            const sitemap_files = multimatch(files, 'sitemap*.xml');
            sitemap_files.reverse();
            debug('sitemap files: %o', sitemap_files);
            return writeFile(path.join(__dirname, 'site/sitemap.xml'), sitemap.buildSitemapIndex({
                urls: sitemap_files
            }));
        }
    ).then(() => info('Saved `sitemap.xml` index'))
    .catch(err => {
        error('There was an issue creating `sitemap.xml`');
        throw err;
    });
    console.timeEnd('full-build');

}).catch(function (err) {
    error(err);
    throw err;
});
