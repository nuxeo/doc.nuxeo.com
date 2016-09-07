'use strict';
/* eslint-env es6 */

// Debugging
const {debug, warn, error} = require('../debugger')('metalsmith-replace-multiexcerpts');

// npm packages
const escape_regex = require('escape-string-regexp');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

// local packages
const get_placeholder_key = require('../get_placeholder_key');

/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
**/
const replace_placeholder = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        const metadata = metalsmith.metadata();
        const placeholder_re = /\{\{\{?multiexcerpt +['"](.+?)['"]( page=['"](.+?)['"])? ?\}\}\}?/i;

        Object.keys(files).forEach(function (filepath) {
            const file = files[filepath];

            let changed = false;
            let contents = file.contents.toString();
            let match;
            let key;
            let replacement_re;
            let safeguard = 999; // Safeguard

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
                    warn('No replacement found for: %s in "%s"', key, file.title);
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
