'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-excerpts');
var error = debug_lib('metalsmith-excerpts:error');
var multimatch = require('multimatch');
var cheerio = require('cheerio');
var get = require('lodash.get');
var set = require('lodash.set');
var Joi = require('joi');

var placeholder_replacement = require('./placeholder_replacement');

var schema = Joi.array().min(1).items(Joi.object().keys({
    pattern     : [Joi.array().min(1).required(), Joi.string().required()],
    fields      : Joi.array().optional().default(['excerpt']),
    default     : Joi.string().optional().default(''),
    metadata_key: Joi.string().optional()
}));

var special_methods = {
    first_paragraph: function (file) {
        var $ = cheerio.load(file.contents.toString());
        var p = $('p').first();
        return $.html(p).trim();
    },
    excerpt_placeholder: function (file) {
        // {{! excerpt}}Excerpt content{{! /excerpt}}
        var re_definition = new RegExp('{{! excerpt ?}}([\\s\\S]+?){{! +\/excerpt ?}}', 'gm');
        var match = re_definition.exec(file.contents.toString());

        return (match) ? match[1] : void 0;
    }
};


/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
**/
var excerpts = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
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

        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            options.forEach(function (option) {
                if (multimatch(filepath, option.pattern).length) {
                    var excerpt;
                    option.fields.forEach(function (field) {
                        if (!excerpt) {
                            if (special_methods[field]) {
                                excerpt = special_methods[field](file);
                            }
                            else {
                                excerpt = get(file, field);
                            }
                        }
                    });
                    excerpt = excerpt || option.default;

                    debug('Setting %s to %s', option.fields[0], excerpt);
                    set(file, option.fields[0], excerpt);

                    if (excerpt && option.metadata_key) {
                        var metadata = metalsmith.metadata();
                        var metadata_key = placeholder_replacement(option.metadata_key, file, true);
                        debug('Setting metadata %s to %s', metadata_key, excerpt);
                        metadata.excerpts = metadata.excerpts || {};
                        metadata.excerpts[metadata_key] = excerpt;
                    }
                }
            });
        });
        done();
    };
};

module.exports = excerpts;
