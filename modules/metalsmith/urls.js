'use strict';
/* eslint-env es6 */

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-urls');
var error = debug_lib('metalsmith-urls:error');
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
    spaces: Joi.array().optional().items(Joi.object().keys({
        space_path: Joi.string().required(),
        space_name: Joi.string().required()
    })),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

var urls = function (options, add_to_metadata) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        metadata.pages = metadata.pages || {};

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

        var version_path = '';
        var version_label = '';
        if (options.versions) {
            let current_version = options.versions.filter(version => version.is_current_version);
            if (current_version && current_version[0]) {
                current_version = current_version[0];
                version_path = current_version.url_path;
                version_label = current_version.label;
            }
        }

        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            var file = files[filepath];
            if (multimatch(filepath, options.file_pattern).length) {

                var file_path_info = path.parse(filepath);
                var filepath_parts = file_path_info.dir.split(path.sep);

                file.url = {
                    key: {
                        version   : '',
                        space     : '',
                        space_path: '',
                        slug      : '',
                        parts     : [],
                        full      : ''
                    },
                    original_filepath: filepath
                };
                // Set the base version path
                if (version_path) {
                    file.url.key.version = version_path;
                    file.url.key.version_label = version_label;
                    file.url.key.parts.push(version_path);
                }

                // Set the space path
                var space = (filepath_parts.length) ? filepath_parts.shift() : '';
                if (space) {
                    file.url.key.space = space;
                    file.url.key.parts.push(space);
                    file.url.key.space_path = file.url.key.parts.join(path.sep);

                    // Get the space_name
                    if (options.spaces) {
                        let config_space = options.spaces.filter(this_space => space === this_space.space_path);
                        if (config_space && config_space[0] && config_space[0].space_name) {
                            file.url.key.space_name = config_space[0].space_name;
                        }
                        else {
                            error('Missing config for space: "%s"', space);
                        }
                    }
                    else {
                        error('Missing spaces config: "%s"', space);
                    }
                }


                // Set slug path
                file.slug = file.slug || (file_path_info.name === 'index' ? 'index' : void 0) || (file.title ? slug(file.title) : void 0) || slug(file_path_info.name);

                // Set full url path
                var full_url_parts = file.url.key.parts.map(function (item) { return item; });

                if (file.slug === 'index') {
                    if (space && !filepath_parts.length) {
                        file.url.key.is_space_index = true;
                    }
                }
                else {
                    full_url_parts.push(file.slug);
                }
                // root only has `/`
                file.url.full = (full_url_parts.join(path.sep)) ? path.sep + full_url_parts.join(path.sep) + path.sep : '/';

                // Add to url.key
                if (file.slug) {
                    file.url.key.slug = file.slug;
                    file.url.key.parts.push(file.url.key.slug);
                }

                // Set full key and new_filepath
                if (file.url.key.parts.length) {
                    file.url.key.full = file.url.key.parts.join(path.sep);
                    file.url.new_filepath = file.url.key.full + file_path_info.ext;
                }
                else {
                    error('Full url could not be assigned to: %s', filepath);
                }
                debug('Filepath: %s, url: %o', filepath, file.url.full);

                // Add to metadata.pages array
                if (add_to_metadata) {
                    if (metadata.pages[file.url.key.full]) {
                        error('Duplicate key found: "%s" in "%s"', file.url.key.full, file.title);
                    }
                    else {
                        metadata.pages[file.url.key.full] = {
                            title      : file.title,
                            url        : file.url.full,
                            is_redirect: !!(file.redirect || file.redirect_source)
                        };
                    }
                }
            }
            else {
                error('Ignorning: %s', filepath);
            }
        });
        return done();
    };
};

module.exports = urls;
