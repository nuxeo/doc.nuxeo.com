'use strict';
/* eslint-env es6 */

const content_filter = (process.env.NODE_ENV === 'development' && process.env.FILTER) ? process.env.FILTER.split(',') : void 0;

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
const metalsmith_if  = require('metalsmith-if');
const frontmatter    = require('metalsmith-matters');

// metalsmith local packages
const urls           = require('../modules/metalsmith/urls');
const excerpts       = require('../modules/metalsmith/excerpts');
const hierarchies    = require('../modules/metalsmith/hierarchies');
const multiexcerpts  = require('../modules/metalsmith/multiexcerpts');
const filter         = require('../modules/metalsmith/filter');
const get_assets     = require('../modules/metalsmith/get_assets');
const get_metadata   = require('../modules/metalsmith/get_metadata');

debug('Node Environment: %s', process.env.NODE_ENV);

const pre_build = function (source_path) {
    info('Starting pre-build: %s', source_path);

    const module_config = yaml_config.load(path.join(__dirname, '../config.yml'));
    debug('Module Config: %o', module_config);

    const instance_config = yaml_config.load(path.join(source_path, '../config.yml'));
    debug('Instance Config: %o', instance_config);

    return new Promise(function (resolve, reject) {
        const config = extend({}, module_config, instance_config);

        const metalsmith_working_path = path.join(__dirname, '..');
        // const relative_destination_path = path.relative(metalsmith_working_path, destination_path);
        var version_path = '';
        if (config.site.versions) {
            let current_version = config.site.versions.filter(version => version.is_current_version);
            if (current_version && current_version[0]) {
                current_version = current_version[0];
                version_path = current_version.url_path;
            }
        }

        metalsmith(metalsmith_working_path)
        .source(source_path)
        .clean(false)
        // Check frontmatter is not malformed
        .frontmatter(false)
        .use(frontmatter({
            strict: true
        }))
        // Filters and Limits to speed up writing
        .use(metalsmith_if(
            content_filter,
            filter({
                pattern: content_filter
            })
        ))
        // Standard site processing
        .metadata({
            site: config.site
        })
        .use(urls(config.site, true))
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
            path       : path.join(source_path, '../assets'),
            path_prefix: version_path
        }))
        .use(get_metadata({
            keys: [
                'hierarchies',
                'excerpts',
                'multiexcerpt',
                'pages',
                'assets'
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
