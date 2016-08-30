'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-versions');
var error = debug_lib('metalsmith-versions:error');

var Joi = require('joi');
var multimatch = require('multimatch');

var get_placeholder_key = require('../get_placeholder_key');
var key_to_url = require('../key_to_url');

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

        if (options.versions && options.versions.length) {
            Object.keys(files).forEach(function (filepath) {
                debug('Filepath: %s', filepath);
                var file = files[filepath];
                if (multimatch(filepath, options.file_pattern).length && file.url) {
                    options.versions.forEach(function (version) {
                        file.url.versions = file.url.versions || [];
                        var add_item = true;
                        var version_key;

                        var version_item = {
                            label             : version.label,
                            is_current_version: !!version.is_current_version
                        };
                        if (file.version_override && file.version_override[version.label]) {
                            if (file.version_override[version.label] === 'none') {
                                add_item = false;
                            }
                            version_key = get_placeholder_key(file.version_override[version.label], file.url.key);
                        }
                        else {
                            var version_key_parts = [];
                            if (version.url_path) {
                                version_key_parts.push(version.url_path);
                            }
                            version_key_parts.push(file.url.key.space, file.url.key.slug);
                            version_key = version_key_parts.join('/');
                        }

                        if (add_item) {
                            try {
                                version_item.url = key_to_url(version_key, metadata.pages);
                            }
                            catch (e) {
                                // error('%s; Title: "%s"', e.message, file.title);
                                version_item.no_page = true;
                                version_item.url = '/' + version_key;
                            }
                            file.url.versions.push(version_item);
                        }
                    });
                    // metadata.pages[file.url.key.full] = {
                    //     title: file.title,
                    //     url  : file.url.full
                    // };
                }
                else {
                    error('Ignorning: %s', filepath);
                }
            });
        }
        return done();
    };
};

module.exports = urls;
