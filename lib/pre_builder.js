'use strict';
/* eslint-env es6 */

// debugging
const debug_lib      = require('debug');
const debug          = debug_lib('doc-pre-builder');
const info           = debug_lib('doc-pre-builder:info');
// const error          = debug_lib('doc-pre-builder:error');

// npm packages
const extend = require('lodash.defaultsdeep');
const path           = require('path');
const Promise = require('bluebird');
const yaml_config    = require('node-yaml-config');

// metalsmith npm packages
const metalsmith     = require('metalsmith');
const frontmatter    = require('metalsmith-matters');

// metalsmith local packages
const excerpts          = require('../modules/metalsmith/excerpts');
const get_assets        = require('../modules/metalsmith/get_assets');
const get_metadata      = require('../modules/metalsmith/get_metadata');
const hierarchies       = require('../modules/metalsmith/hierarchies');
const list_from_details = require('../modules/metalsmith/list_from_details');
const multiexcerpts     = require('../modules/metalsmith/multiexcerpts');
const set_versions      = require('../modules/metalsmith/set_versions');
const urls              = require('../modules/metalsmith/urls');

debug('Node Environment: %s', process.env.NODE_ENV);


const pre_build = function (repo_details) {
    const {repo_id, repo_path, branch} = repo_details;
    info('Starting pre-build: %s', repo_path);
    const module_config = yaml_config.load(path.join(__dirname, '../config.yml'));
    debug('Module Config: %o', module_config);

    const instance_config = yaml_config.load(path.join(repo_path, '../config.yml'));
    debug('Instance Config: %o', instance_config);

    return new Promise(function (resolve, reject) {
        const config = extend({}, module_config, instance_config);

        const metalsmith_working_path = path.join(__dirname, '..');

        metalsmith(metalsmith_working_path)
        .source(repo_path)
        .clean(false)
        // Ignore files
        .ignore(config.site.remove_files_pattern)
        // Check frontmatter is not malformed
        .frontmatter(false)
        .use(frontmatter({
            strict: true
        }))
        // Standard site processing
        .metadata({
            site: config.site
        })
        .use(set_versions({
            branch,
            repo_id,
            repositories: config.repositories
        }))
        .use(urls(config.site, true))
        .use(list_from_details())
        .use(hierarchies(config.site))
        .use(excerpts([
            {
                pattern: '**/*.{md,html}',
                fields : [
                    'excerpt',
                    'excerpt_placeholder'
                ],
                metadata_key: 'url.key.full'
            }
        ]))
        .use(multiexcerpts())
        .use(get_assets({
            assets_path: path.join(repo_path, '../assets')
        }))
        .use(get_metadata({
            keys: [
                'assets',
                'excerpts',
                'hierarchies',
                'lists',
                'multiexcerpt',
                'pages'
            ]
        }, resolve))
        .process(function (err) {
            if (err) {
                reject(err);
            }
        });
    });
};

module.exports = pre_build;
