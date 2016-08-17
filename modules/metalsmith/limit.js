'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-limit');
var error = debug_lib('metalsmith-limit:error');
var Joi = require('joi');
var multimatch   = require('multimatch');
var sortby = require('lodash.sortby');

var schema = Joi.object().keys({
    limit  : Joi.number().required(),
    pattern: Joi.array().min(1).items(Joi.string()).required(),
    sortBy : Joi.string().optional(),
    reverse: Joi.boolean().optional()
});

var limit = function (options) {
    /* eslint guard-for-in:0 */
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        var matched_indexes = [];
        // Check options fits schema
        schema.validate(options, function (err) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
        });

        // Object.keys(files).forEach(function (file) {
        for (var file in files) {
            if (multimatch(file, options.pattern).length) {
                matched_indexes.push({file: file, sort_by: (options.sortBy) ? files[file][options.sortBy] : file});
                debug('Adding %s to limit list', file);
            }
        }

        matched_indexes = sortby(matched_indexes, ['sort_by', 'file']);

        if (options.reverse) {
            matched_indexes.reverse();
        }

        // Remove files from processing
        matched_indexes = matched_indexes.slice(options.limit);

        for (var file_id in matched_indexes) {
            var file_to_remove = matched_indexes[file_id].file;
            debug('Removing %s from being processed', file_to_remove);
            delete files[file_to_remove];
        }

        done();
    };
};

module.exports = limit;
