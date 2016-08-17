'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-get-metadata');
// var error = debug_lib('metalsmith-get-metadata:error');
var is_empty = require('lodash.isempty');
// // var Joi = require('joi');
// var multimatch   = require('multimatch');
// var get = require('lodash.get');

// var schema = Joi.object();

var get_metadata = function (options, resolve) {
    /* eslint guard-for-in:0 */
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        var metadata_to_return = {};
        options.keys.forEach(function (key) {
            metadata_to_return[key] = metadata[key];
        });
        if (is_empty(metadata_to_return)) {
            return done(new Error('Metadata was empty'));
        }
        else {
            resolve(metadata_to_return);
        }
        return done();
    };
};

module.exports = get_metadata;
