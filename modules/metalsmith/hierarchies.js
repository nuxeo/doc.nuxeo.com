'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-hierarchies');
var error = debug_lib('metalsmith-hierarchies:error');
var Joi = require('joi');
var path = require('path');
var multimatch = require('multimatch');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var schema = Joi.object().keys({
    versions: Joi.array().optional().items(Joi.object().keys({
        label             : Joi.string().required(),
        is_current_version: Joi.bool().optional().default(false),
        url_path          : Joi.string().optional().default('')
    })),
    flatten     : Joi.bool().optional().default(true),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

var meta_hierarchies = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        // Check options fits schema
        var schema_err;
        schema.validate(options, {allowUnknown: true}, function (err, value) {
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                schema_err = err;
            }
            options = value;
        });
        if (schema_err) {
            return done(schema_err);
        }

        var metadata = metalsmith.metadata();
        var hierarchies = {};
        var version_path = '';
        if (options.versions && options.versions.length) {
            options.versions.forEach(function (version) {
                version_path = (version.is_current_version) ? version.url_path : version_path;
            });
        }

        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            var file = files[filepath];

            if (multimatch(filepath, options.file_pattern).length) {

                var file_path_info = path.parse(filepath);
                var filepath_parts = file_path_info.dir.split(path.sep);
                filepath_parts.shift();

                var space_path = file.url.key.space_path;
                var is_space_index = file.url.key.is_space_index;

                // file.hierarchy = file.hierarchy || {};

                if (space_path) {
                    var current_item = hierarchies[space_path] = hierarchies[space_path] || {
                        id  : space_path,
                        name: '',
                        url : {},
                        slug: '',
                        path: space_path
                    };

                    if (is_space_index) {
                        current_item.name = file.title;
                        current_item.url = file.url;
                    }
                    debug('Key: %s, path: %o', file.url.key.full, filepath_parts, current_item);

                    filepath_parts.forEach(function (item) {
                        var missing_node = true;
                        if (current_item.children) {
                            current_item.children.forEach(function (child) {
                                if (child.id === item) {
                                    current_item = child;
                                    missing_node = false;
                                }
                            });
                        }
                        if (missing_node) {
                            done(new Error('Missing parents for file: ' + filepath));
                        }
                    });

                    // Don't include hidden pages
                    if (!file.hidden) {
                        current_item.children = current_item.children || [];
                        current_item.children.push({
                            id  : file_path_info.name,
                            name: file.title,
                            url : file.url,
                            slug: file.slug,
                            path: space_path
                        });
                    }
                }
            }
            else {
                debug('Ignorning: %s', filepath);
            }
        });
        // debug('hierarchies', hierarchies);

        metadata.hierarchies = hierarchies;

        return done();
    };
};

module.exports = meta_hierarchies;
