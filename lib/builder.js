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

var debug_lib      = require('debug');
var debug          = debug_lib('nuxeo-doc-builder');
var error          = debug_lib('nuxeo-doc-builder:error');
var path           = require('path');
var yaml_config    = require('node-yaml-config');
var extend         = require('lodash.assignin');

var metalsmith     = require('metalsmith');
// var collections    = require('metalsmith-collections');
var default_values = require('metalsmith-default-values');
var frontmatter    = require('metalsmith-matters');
var gzip           = require('metalsmith-gzip');
var in_place       = require('metalsmith-in-place');
var layouts        = require('metalsmith-layouts');
var markdown       = require('metalsmith-markdown');
var metalsmith_if  = require('metalsmith-if');
var permalinks     = require('metalsmith-permalinks');
// var sitemap        = require('metalsmith-sitemap');

var excerpts       = require('../modules/metalsmith_excerpts');
var filter         = require('../modules/metalsmith_filter');
var hierarchy      = require('../modules/metalsmith_hierarchy');
var history        = require('../modules/metalsmith_history');
var multiexcerpts  = require('../modules/metalsmith_multiexcerpts');
var webpack_assets = require('../modules/metalsmith_webpack_assets');
var file_contents_preprocess = require('../modules/metalsmith_file_contents_preprocess');
var list_from_field = require('../modules/metalsmith_list_from_field');
var pages_from_list = require('../modules/metalsmith_pages_from_list');


var markdown_renderer = require('../modules/markdown_renderer');

var module_config = yaml_config.load(path.join(__dirname, '.../config.yml'));
module_config.markdown_options.renderer = markdown_renderer;

// var default_values = require('../modules/metalsmith_default_values');
// var logging        = require('../modules/metalsmith_logging');

var handlebars_helpers = {
    condition   : require('../modules/handlebars_condition'),
    excerpt     : require('../modules/handlebars_excerpt'),
    file        : require('../modules/handlebars_file_path'),
    file_content: require('../modules/handlebars_file_content'),
    head_title  : require('../modules/handlebars_head_title'),
    inline_svg  : require('../modules/handlebars_inline_svg'),
    md          : require('../modules/handlebars_markdown')(module_config.markdown_options),
    moment      : require('../modules/handlebars_moment'),
    multiexcerpt: require('../modules/handlebars_multiexcerpt'),
    obj_key     : require('../modules/handlebars_object_key'),
    page        : require('../modules/handlebars_page_path'),
    sort_object : require('../modules/handlebars_sort_object'),
    sluggy      : require('../modules/handlebars_sluggy')
};

debug('Node Environment: %s', process.env.NODE_ENV);
debug('Config: %o', module_config);

console.time('Built');


var build = function (instance_config) {
    var config = extend({}, module_config, instance_config);

    metalsmith(__dirname)
    .source('./src')
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
    .use(file_contents_preprocess())
    // .use(logging.file_details)
    // .use(logging.metadata)
    .use(webpack_assets({
        stats_file: 'webpack.stats.json'
    }))
    .use(history({
        pattern: '**/*.{md,html}',
        reverse: true
    }))
    .use(hierarchy(config.site.spaces))
    .use(default_values(config.page_defaults))
    .use(excerpts([
        {
            pattern: '**/*.{md,html}',
            fields : [
                'excerpt',
                'excerpt_placeholder'
            ],
            metadata_key: ':hierarchy.space_path/:slug'
        }
    ]))
    .use(multiexcerpts())
    // .use(collections({
    //     nxdoc: 'nxdoc/*'
    // }))
    .use(list_from_field({
        pattern        : 'nxdoc/*.md',
        field          : 'labels',
        key_name       : 'labels',
        fields_to_store: {
            title: 'title',
            slug : 'slug',
            path : 'hierarchy.space_path'
        },
        sort_field: 'title'
    }))
    .use(pages_from_list({
        path               : 'nxdoc/label',
        list_key           : 'labels',
        list_index_defaults: {
            title : 'Labels',
            layout: 'labels.hbs'
        },
        defaults: {
            layout      : 'label.hbs',
            no_side_menu: true,
            hierarchy   : {
                parents: [
                    {name: 'Nuxeo Platform Developer Documentation', url: '/nxdoc/'},
                    {name: 'Labels', url: '/nxdoc/label/'}
                ]
            }
        }
    }))
    .use(in_place({
        pattern : '**/*',
        engine  : 'handlebars',
        partials: 'layouts/partials',
        helpers : handlebars_helpers
    }))
    .use(markdown(config.markdown_options))
    .use(layouts({
        engine   : 'handlebars',
        directory: 'layouts',
        partials : 'layouts/partials',
        helpers  : handlebars_helpers
    }))
    .use(permalinks({
        relative: false
    }))
    .use(gzip())
    .destination('./site')
    .build(function (err) {
        // For error handling
        if (err) {
            error(err);
            throw err;
        }
        console.timeEnd('Built');
    });
};

module.exports = build;
