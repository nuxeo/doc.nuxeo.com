'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-excerpts');
var error = debug_lib('metalsmith-excerpts:error');
var info = debug_lib('metalsmith-excerpts:info');
var multimatch = require('multimatch');
var cheerio = require('cheerio');
var get = require('lodash.get');
var set = require('lodash.set');
var Joi = require('joi');

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
    },
    from_metadata_key: function (file, metadata, key) {
        return (metadata && metadata.excerpts && key) ? get(metadata, key) : void 0;
    }
};


/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
**/
var excerpts = function (options) {
    info('Processing');
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

        var metadata = metalsmith.metadata();

        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            options.forEach(function (option) {
                var key = get(file, option.metadata_key);
                if (multimatch(filepath, option.pattern).length) {
                    var excerpt;
                    option.fields.forEach(function (field) {
                        if (!excerpt) {
                            if (typeof field === 'function') {
                                excerpt = field(file, metadata, key);
                            }
                            else if (special_methods[field]) {
                                excerpt = special_methods[field](file, metadata, key);
                            }
                            else {
                                excerpt = get(file, field);
                            }
                        }
                    });
                    excerpt = excerpt || option.default;

                    debug('Setting %s to %s', option.fields[0], excerpt);
                    set(file, option.fields[0], excerpt);

                    if (excerpt && key) {
                        debug('Setting metadata %s to %s', key, excerpt);
                        metadata.excerpts = metadata.excerpts || {};
                        metadata.excerpts[key] = excerpt;
                    }
                }
            });
        });
        done();
    };
};

module.exports = excerpts;
