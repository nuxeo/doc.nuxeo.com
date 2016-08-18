'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-replace-multiexcerpts');
var error = debug_lib('metalsmith-replace-multiexcerpts:error');

var escape_regex = require('escape-string-regexp');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

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
        var placeholder_re = /\{\{\{?multiexcerpt +['"](.+?)['"]( page=['"](.+?)['"])? ?\}\}\}?/i;

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
                key = get_placeholder_key(match[3], file.url.key) + '/' + slug(match[1]);
                replacement_re = new RegExp(escape_regex(match[0]), 'g');
                debug('Looking for: %s in %s', key, file.title);
                if (metadata.multiexcerpt[key]) {
                    debug('Replacing: %s', match[0]);
                    contents = contents.replace(replacement_re, metadata.multiexcerpt[key]);
                }
                else {
                    error('No replacement found for: %s in "%s"', key, file.title);
                    contents = contents.replace(replacement_re, '{{! Multiexcerpt replacement failed for: ' + match[1] + ' }}');
                }
            }
            if (!safeguard) {
                error('Did not finish replacements before safeguard');
            }
            if (changed) {
                // if (file.title === 'Collaborative Features') { error('Saving changes in: %s', file.title, contents); }
                debug('Saving changes in: %s', file.title);
                file.contents = new Buffer(contents);
            }
        });
        done();
    };
};

module.exports = replace_placeholder;
