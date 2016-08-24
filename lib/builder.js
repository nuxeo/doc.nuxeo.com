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
var debug_lib = require('debug');
var debug = debug_lib('doc-builder');
var info = debug_lib('doc-builder:info');
// var error = debug_lib('doc-builder:error');

// npm packages
var extend = require('lodash.defaultsdeep');
var path = require('path');
var yaml_config = require('node-yaml-config');

// metalsmith npm packages
var metalsmith = require('metalsmith');
var default_values = require('metalsmith-default-values');
var frontmatter = require('metalsmith-matters');
var gzip = require('metalsmith-gzip');
var in_place = require('metalsmith-in-place');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var metalsmith_if = require('metalsmith-if');
var permalinks = require('metalsmith-permalinks');
// var collections = require('metalsmith-collections');
// var sitemap = require('metalsmith-sitemap');

// metalsmith local packages
var css_md5 = require('../modules/metalsmith/css_md5');
var file_contents_preprocess = require('../modules/metalsmith/file_contents_preprocess');
var filter = require('../modules/metalsmith/filter');
var fix_handlebars = require('../modules/metalsmith/fix_handlebars');
var hierarchy = require('../modules/metalsmith/hierarchy');
var history = require('../modules/metalsmith/history');
var list_from_field = require('../modules/metalsmith/list_from_field');
var pages_from_list = require('../modules/metalsmith/pages_from_list');
var redirects = require('../modules/metalsmith/redirects');
var replace_excerpts = require('../modules/metalsmith/replace_excerpts');
var replace_multiexcerpts = require('../modules/metalsmith/replace_multiexcerpts');
var review_flag = require('../modules/metalsmith/review_flag');
var urls = require('../modules/metalsmith/urls');
var versions = require('../modules/metalsmith/versions');
var webpack_assets = require('../modules/metalsmith/webpack_assets');

// local packages
var markdown_renderer = require('../modules/markdown_renderer');


debug('Node Environment: %s', process.env.NODE_ENV);


var build = function (source_path, metadata, destination_path) {
    info('Starting build: %s', source_path);

    var module_config = yaml_config.load(path.join(__dirname, '../config.yml'));
    debug('Module Config: %o', module_config);

    module_config.markdown_options.renderer = markdown_renderer;

    var handlebars_helpers = {
        condition   : require('../modules/handlebars/condition'),
        file        : require('../modules/handlebars/file_path'),
        file_content: require('../modules/handlebars/file_content'),
        head_title  : require('../modules/handlebars/head_title'),
        inline_svg  : require('../modules/handlebars/inline_svg'),
        md          : require('../modules/handlebars/markdown')(module_config.markdown_options),
        moment      : require('../modules/handlebars/moment'),
        obj_key     : require('../modules/handlebars/object_key'),
        page        : require('../modules/handlebars/page_path'),
        sort_object : require('../modules/handlebars/sort_object'),
        sluggy      : require('../modules/handlebars/sluggy')
    };

    var instance_config = yaml_config.load(path.join(source_path, '../config.yml'));
    debug('Instance Config: %o', instance_config);

    var version_path = '';
    if (instance_config.site && instance_config.site.versions && instance_config.site.versions.length) {
        instance_config.site.versions.forEach(function (version) {
            version_path = (version.is_current_version) ? version.url_path : version_path;
        });
    }

    var config = extend({}, module_config, instance_config);

    // Add site config to the metadata
    var metad = extend({}, metadata, {
        site: config.site
    });

    var space_labels = [];
    var space_label_pages = [];
    if (config && config.site && config.site.spaces && config.site.spaces.length) {
        config.site.spaces.forEach(function (space) {
            var version_space_path = (version_path) ? version_path + '/' + space.space_path : space.space_path;
            var version_space_key = version_space_path.split('/').join('_');
            space_labels.push({
                pattern        : version_space_path + '/*.md',
                field          : 'labels',
                key_name       : version_space_key + '_labels',
                fields_to_store: {
                    title: 'title',
                    slug : 'slug',
                    path : 'url.key.space_path'
                },
                sort_field: 'title'
            });

            space_label_pages.push({
                path               : version_space_path + '/label',
                list_key           : version_space_key + '_labels',
                list_index_defaults: {
                    title : 'Labels',
                    layout: 'labels.hbs',
                    url   : {
                        key: {
                            version   : version_path,
                            space     : space.space_path,
                            space_path: version_space_path,
                            slug      : 'label',
                            parts     : [],
                            full      : ''
                        }
                    }
                },
                defaults: {
                    layout      : 'label.hbs',
                    no_side_menu: true,
                    hierarchy   : {
                        parents: [
                            {name: space.space_name, url: '/' + version_space_path + '/'},
                            {name: 'Labels', url: '/' + version_space_path + '/label/'}
                        ]
                    },
                    url: {
                        key: {
                            version   : version_path,
                            space     : space.space_path,
                            space_path: version_space_path,
                            slug      : 'label',
                            parts     : [],
                            full      : ''
                        }
                    }
                }
            });
        });
    }

    var handlebars_options = {
        engine  : 'handlebars',
        partials: 'layouts/partials',
        helpers : handlebars_helpers
    };

    var metalsmith_working_path = path.join(__dirname, '..');
    var relative_destination_path = path.relative(metalsmith_working_path, destination_path);

    return metalsmith(metalsmith_working_path)
    // return new Promise(function (resolve, reject) {
    //     return metalsmith(metalsmith_working_path)
    .source(source_path)
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
    // Add metadata
    .metadata(metad)
    .use(file_contents_preprocess())
    // .use(logging.file_details)
    // .use(logging.metadata)
    .use(webpack_assets({
        stats_file: 'lib/webpack.stats.json'
    }))
    .use(css_md5({
        stats_file: 'lib/css.md5'
    }))
    .use(history({
        pattern: '**/*.{md,html}',
        reverse: true
    }))
    .use(review_flag)
    .use(urls(config.site))
    .use(hierarchy(config.site))
    .use(redirects())
    .use(versions(config.site))
    .use(default_values(config.page_defaults))
    .use(list_from_field(space_labels))
    .use(pages_from_list(space_label_pages))
    .use(markdown(config.markdown_options))
    .use(fix_handlebars())
    .use(replace_multiexcerpts())
    .use(replace_excerpts())
    .use(in_place(extend({}, handlebars_options, {
        pattern: '**/*'
    })))
    .use(layouts(extend({}, handlebars_options, {
        directory: 'layouts'
    })))
    .use(permalinks({
        relative: false
    }))
    .use(gzip())
    .destination(relative_destination_path)
    .build();
};

module.exports = build;
