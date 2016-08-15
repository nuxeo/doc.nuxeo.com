'use strict';
/* eslint no-console: 0 */

// Assume production if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Set Debugging up
if (!process.env.DEBUG) {
    process.env.DEBUG = '*:error';
}
var content_filter = (process.env.NODE_ENV === 'development' && process.env.FILTER) ? process.env.FILTER.split(',') : void 0;

// debugging
var debug_lib      = require('debug');
var debug          = debug_lib('nuxeo-doc-pre-build');
// var error          = debug_lib('nuxeo-doc-pre-build:error');

// npm packages
var Promise = require('bluebird');
var path           = require('path');
var yaml_config    = require('node-yaml-config');
var extend         = require('lodash.assignin');

// metalsmith npm packages
var metalsmith     = require('metalsmith');
var metalsmith_if  = require('metalsmith-if');
var frontmatter    = require('metalsmith-matters');

// metalsmith local packages
var urls           = require('../modules/metalsmith_urls');
var excerpts       = require('../modules/metalsmith_excerpts');
var hierarchies    = require('../modules/metalsmith_hierarchies');
var multiexcerpts  = require('../modules/metalsmith_multiexcerpts');
var filter         = require('../modules/metalsmith_filter');
var get_metadata   = require('../modules/metalsmith_get_metadata');

var module_config = yaml_config.load(path.join(__dirname, '../config.yml'));

debug('Node Environment: %s', process.env.NODE_ENV);
// debug('Config: %o', module_config);

console.time('Pre-Built');

var pre_build = function (source_path) {
    var instance_config = yaml_config.load(path.join(source_path, '../config.yml'));
    return new Promise(function (resolve, reject) {
        var config = extend({}, module_config, instance_config);

        var metalsmith_working_path = path.join(__dirname, '..');
        // var relative_destination_path = path.relative(metalsmith_working_path, destination_path);

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
        .use(urls(config.site))
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
        .use(get_metadata({
            keys: [
                'hierarchies',
                'excerpts',
                'multiexcerpt'
            ]
        }, resolve, reject))
        .process(function (err) {
            if (err) {
                reject(err);
            }
            console.timeEnd('Pre-Built');
        });
    });

    // .destination('/tmp/doc.nuxeo.com-pre-build')
    // .build(function (err) {
    //     if (err) {
    //         throw new Error(err);
    //     }
    //     console.timeEnd('Pre-Built');
    // });
};

module.exports = pre_build;
