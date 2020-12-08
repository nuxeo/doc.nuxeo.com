'use strict';
/* eslint-env es6 */

// Debugging
const { warn } = require('../debugger')('handlebars-file-content');

// npm packages
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const file_content = function (options) {
  const url = options.hash.url || '';
  const content =
    options.data.root.file_content && options.data.root.file_content[slug(url)];

  if (!content) {
    warn(
      'Content not located for: "%s" in: "%s"',
      url,
      options.data.root.title
    );
  }
  return content ? content : '';
};

module.exports = file_content;
