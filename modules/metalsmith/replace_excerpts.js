'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')('metalsmith-replace-excerpts');

// npm packages
const escape_regex = require('escape-string-regexp');

// local packages
const get_placeholder_key = require('../get_placeholder_key');
const get_placeholder_object = require('../get_placeholder_object');
const get_placeholder_string = require('../get_placeholder_string');

/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
 **/
const replace_placeholder = function(options) {
  debug('Options: %o', options);
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    const placeholder_re = /\{\{\{?excerpt +([^}]+)\}\}\}?/i;

    Object.keys(files).forEach(function(filepath) {
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
        const placeholder_parts = get_placeholder_object(match[1]);
        // If name exists version, space and page are ignored.
        const raw_page_name = placeholder_parts.name
          ? placeholder_parts.name
          : get_placeholder_string(placeholder_parts);
        key = get_placeholder_key(raw_page_name, file.url.key);
        replacement_re = new RegExp(escape_regex(match[0]), 'g');
        // if (file.title === 'Collaborative Features') { error('match: %s, key: %s', match[0], key); }
        debug('Looking for: %s in %s', key, file.title);
        if (metadata.excerpts[key]) {
          debug('Replacing: %s', match[0]);
          contents = contents.replace(replacement_re, metadata.excerpts[key]);
        } else {
          warn('No replacement found for: %s in "%s"', key, file.title);
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
