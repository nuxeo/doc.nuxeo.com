'use strict';

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
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

var urls = function (options) {
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
                    file.url.key.parts.push(version_path);
                }

                // Set the space path
                var space = (filepath_parts.length) ? filepath_parts.shift() : '';
                if (space) {
                    file.url.key.space = space;
                    file.url.key.parts.push(space);
                    file.url.key.space_path = file.url.key.parts.join(path.sep);
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
                file.url.full = path.sep + full_url_parts.join(path.sep) + path.sep;

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
            }
            else {
                debug('Ignorning: %s', filepath);
            }
        });
        return done();
    };
};

module.exports = urls;
