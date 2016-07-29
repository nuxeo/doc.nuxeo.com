'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-pages-from_list');
var error = debug_lib('metalsmith-pages-from_list:error');
var Joi = require('joi');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var schema = Joi.object().keys({
    path               : Joi.string().required(),
    list_key           : Joi.string().required(),
    list_index_defaults: Joi.object().optional(),
    defaults           : Joi.object().optional()
});

var pages_from_list = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();

        // Check options fits schema
        schema.validate(options, function (err) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
        });

        // Expects an array or object.
        var keys = metadata.lists && Array.isArray(metadata.lists[options.list_key]) && metadata.lists[options.list_key] || metadata.lists && Object.keys(metadata.lists[options.list_key]) || [];
        if (keys) {
            keys.forEach(function (item) {
                var filename = options.path + '/' + slug(item) + '.md';

                var data = Object.assign({}, options.defaults);
                data.title = data.title || item;
                data.list_key = options.list_key;
                data.list_item = item;
                // metalsmith expects contents.
                data.contents = data.contents || '';
                files[filename] = data;
                debug('Created: %s', filename);
            });

            // Add index file
            var filename = options.path + '.md';
            // Clone - necessary to perform pop.
            var defaults = JSON.parse(JSON.stringify(options.defaults));
            var data = Object.assign({}, defaults, options.list_index_defaults);
            // Remove last item - this is the index
            data.hierarchy.parents.pop();
            data.title = data.title || options.list_key;
            data.list_key = options.list_key;
            data.path = options.path;

            // metalsmith expects contents.
            data.contents = data.contents || '';
            files[filename] = data;
            debug('Created Index: %s', filename);
        }
        else {
            error('List key is missing: %s', options.list_key);
        }

        done();
    };
};

module.exports = pages_from_list;
