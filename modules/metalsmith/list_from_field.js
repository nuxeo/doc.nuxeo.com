'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-list-from-field');
var info = debug_lib('metalsmith-list-from-field:info');
var error = debug_lib('metalsmith-list-from-field:error');
var multimatch = require('multimatch');
var get = require('lodash.get');
var sortby = require('lodash.sortby');
var Joi = require('joi');

var schema = Joi.array().items(Joi.object().keys({
    pattern        : [Joi.array().min(1).required(), Joi.string().required()],
    field          : Joi.string().required(),
    key_name       : Joi.string().required(),
    fields_to_store: Joi.object().optional(),
    sort_field     : Joi.string().optional()
}));

var list_from_field = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        info('Processing');
        var metadata = metalsmith.metadata();

        // Check options fits schema
        schema.validate(options, function (err, value) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
            // Convert to array if it's a string
            value.forEach(function (option, option_index) {
                var value_option = value[option_index];
                value_option.pattern = (typeof value_option.pattern === 'string') ? [value_option.pattern] : value_option.pattern;
            });
            options = value;
        });

        if (options && options.length) {
            options.forEach(function (option) {
                metadata.lists = metadata.lists || {};
                metadata.lists[option.key_name] = metadata.lists[option.key_name] || {};
            });

            Object.keys(files).forEach(function (filepath) {
                debug('Filepath: %s', filepath);
                var file = files[filepath];
                var fields;
                options.forEach(function (option) {
                    if (multimatch(filepath, option.pattern).length) {
                        fields = get(file, option.field);
                        if (typeof fields === 'string') {
                            fields = [fields];
                        }

                        if (fields) {
                            if (option.fields_to_store) {
                                var page_fields = {};
                                Object.keys(option.fields_to_store).forEach(function (new_key) {
                                    var search_key = option.fields_to_store[new_key];
                                    page_fields[new_key] = get(file, search_key);
                                });
                                debug('page_fields: %o', page_fields);
                            }
                            fields.forEach(function (field) {
                                debug('field value: %s', field);
                                metadata.lists[option.key_name][field] = metadata.lists[option.key_name][field] || [];
                                if (option.fields_to_store) {
                                    metadata.lists[option.key_name][field].push(page_fields);
                                }
                            });
                        }
                    }
                });
            });

            options.forEach(function (option) {
                Object.keys(metadata.lists[option.key_name]).forEach(function (field) {
                    metadata.lists[option.key_name][field] = sortby(metadata.lists[option.key_name][field], option.sort_field);
                });
            });
        }

        // debug('lists %s: %o', options.key_name, metadata.lists[options.key_name]);
        done();
    };
};

module.exports = list_from_field;
