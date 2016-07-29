'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-list-from-field');
var error = debug_lib('metalsmith-list-from-field:error');
var multimatch = require('multimatch');
var get = require('lodash.get');
var sortby = require('lodash.sortby');
var Joi = require('joi');

var schema = Joi.object().keys({
    pattern        : [Joi.array().min(1).required(), Joi.string().required()],
    field          : Joi.string().required(),
    key_name       : Joi.string().required(),
    fields_to_store: Joi.object().optional(),
    sort_field     : Joi.string().optional()
});

var list_from_field = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();

        // Check options fits schema
        schema.validate(options, function (err, value) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
            // Convert to array if it's a string
            value.pattern = (typeof value.pattern === 'string') ? [value.pattern] : value.pattern;
            options = value;
        });

        metadata.lists = metadata.lists || {};
        metadata.lists[options.key_name] = metadata.lists[options.key_name] || {};

        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            var file = files[filepath];
            var fields;
            if (multimatch(filepath, options.pattern).length) {
                fields = get(file, options.field);
                if (typeof fields === 'string') {
                    fields = [fields];
                }

                if (fields) {
                    if (options.fields_to_store) {
                        var page_fields = {};
                        Object.keys(options.fields_to_store).forEach(function (new_key) {
                            var search_key = options.fields_to_store[new_key];
                            page_fields[new_key] = get(file, search_key);
                        });
                        debug('page_fields: %o', page_fields);
                    }
                    fields.forEach(function (field) {
                        debug('field value: %s', field);
                        metadata.lists[options.key_name][field] = metadata.lists[options.key_name][field] || [];
                        if (options.fields_to_store) {
                            metadata.lists[options.key_name][field].push(page_fields);
                        }
                    });
                }
            }
        });

        Object.keys(metadata.lists[options.key_name]).forEach(function (field) {
            metadata.lists[options.key_name][field] = sortby(metadata.lists[options.key_name][field], options.sort_field);
        });

        // debug('lists %s: %o', options.key_name, metadata.lists[options.key_name]);
        done();
    };
};

module.exports = list_from_field;
