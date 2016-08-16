'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-multiexcerpts');
var error = debug_lib('metalsmith-multiexcerpts:error');
var Joi = require('joi');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var open_close_positions = require('./open_close_positions');

var schema = Joi.object().keys({
    placeholder: Joi.string().optional().default('multiexcerpt')
}).default({placeholder: 'multiexcerpt'});


/**
 * A Metalsmith plugin to extract a multiexcerpt from files.
 *
 * @param {Object} options
 * @return {Function}
**/

var multiexcerpts = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        // Check options fits schema
        schema.validate(options, function (err, value) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
            options = value;
        });

        var metadata = metalsmith.metadata();
        var re_definition = new RegExp('{{! ' + options.placeholder + '( +name=["\'](.+?)["\'])}}', 'gm');
        var closing_placeholder = '{{! /multiexcerpt}}';

        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            var contents = file.contents.toString();
            var match;
            var key = file.url.key.full;
            var placeholder_positions = [];
            debug('filepath: %s, key: %s', filepath, key);

            // Get opening placeholder positions
            while ((match = re_definition.exec(contents)) !== null) {
                // page as key: space:page-name else space:page-name:name-of-excerpt
                debug('%s: page: %s, name: %s', options.placeholder, file.title, match[2]);

                placeholder_positions.push({
                    key     : key,
                    type    : 'open',
                    name    : match[2],
                    position: re_definition.lastIndex,
                    raw     : {
                        text       : match[0],
                        match_start: match.index,
                        match_end  : re_definition.lastIndex
                    }
                });
            }

            // Get closing placeholder positions
            var closing_position = contents.indexOf(closing_placeholder);
            while (closing_position !== -1) {
                var last_index = closing_position + closing_placeholder.length;
                placeholder_positions.push({
                    type    : 'close',
                    position: closing_position,
                    raw     : {
                        match_start: closing_position,
                        match_end  : last_index
                    }
                });
                closing_position = contents.indexOf(closing_placeholder, last_index);
            }

            // Get the open and closed positions of the nested placeholders
            try {
                placeholder_positions = open_close_positions(placeholder_positions, 'name', 'position');
            }
            catch (err) {
                error('%s: page: %s, %s', options.placeholder, file.title, err);
                return done(new Error('Page: ' + file.title + '\n\n' + err));
            }
            debug('placeholder_positions: %o', placeholder_positions);

            // Set the multiexcerpts
            if (placeholder_positions.length) {
                metadata[options.placeholder] = metadata[options.placeholder] || {};
                placeholder_positions.forEach(function (placeholder) {
                    var placeholder_key = key + '/' + slug(placeholder.key);
                    debug('placeholder key: %s', placeholder.key);
                    if (metadata[options.placeholder][placeholder_key]) {
                        error('%s - Duplicate placeholder: %s', options.placeholder, placeholder_key);
                    }
                    else {
                        metadata[options.placeholder][placeholder_key] = contents.substring(placeholder.start, placeholder.end);
                        debug('%s - Set: %s', options.placeholder, placeholder_key);
                        // debug('content: %s', metadata[options.placeholder][placeholder.key].content);
                    }
                });
            }
        });

        done();
    };
};

module.exports = multiexcerpts;
