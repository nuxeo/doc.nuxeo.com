'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-replace-excerpts');
var error = debug_lib('metalsmith-replace-excerpts:error');

var escape_regex = require('escape-string-regexp');

var get_placeholder_key = require('../get_placeholder_key');


/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
**/
var replace_placeholder = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        var metadata = metalsmith.metadata();
        var placeholder_re = /\{\{\{?excerpt +['"](.+?)['"] ?\}\}\}?/i;

        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            var changed = false;
            var contents = file.contents.toString();
            var match;
            var key;
            var replacement_re;
            var safeguard = 999; // Safeguard
            while ((match = placeholder_re.exec(contents)) !== null && safeguard) {
                safeguard--;
                changed = true;
                key = get_placeholder_key(match[1], file.url.key);
                replacement_re = new RegExp(escape_regex(match[0]), 'g');
                // if (file.title === 'Collaborative Features') { error('match: %s, key: %s', match[0], key); }
                debug('Looking for: %s in %s', key, file.title);
                if (metadata.excerpts[key]) {
                    debug('Replacing: %s', match[0]);
                    contents = contents.replace(replacement_re, metadata.excerpts[key]);
                }
                else {
                    error('No replacement found for: %s in %s', key, file.title);
                    contents = contents.replace(replacement_re, '{{! Excerpt replacement failed for: ' + match[1] + ' }}');
                }
            }
            if (!safeguard) {
                error('Did not finish replacements before safeguard');
            }
            if (changed) {
                // if (file.title === 'Collaborative Features') { error('Content-excerpt: %s', file.title, contents); }
                debug('Saving changes in: %s', file.title);
                file.contents = new Buffer(contents);
            }
        });
        done();
    };
};

module.exports = replace_placeholder;
