'use strict';
/* eslint-env es6 */

// Debugging
const { warn } = require('../debugger')('handlebars-multiexcerpt');

// npm packages
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;
const slug_map = function(str) {
  return slug(str);
};

const multiexcerpt = function(name, options) {
  // space:page-name:name-of-multiexcerpt
  const key_arr = (options.hash &&
    options.hash.page &&
    options.hash.page.split(':')) || [options.data.root.title];
  if (key_arr.length === 1) {
    // space is missing, add to the start of the array
    key_arr.unshift(options.data.root.hierarchy.space_path);
  }
  key_arr.push(name);
  const key = key_arr.map(slug_map).join('/');

  if (
    !options.data.root.multiexcerpt ||
    !options.data.root.multiexcerpt[key] ||
    !options.data.root.multiexcerpt[key].content
  ) {
    warn('"%s" is not defined. Page title: %s', key, options.data.root.title);

    // if (options.data.root.title === 'MongoDB') {
    //     error('multiexerpts - key: %s, in: %o', key, Object.keys(options.data.root.multiexcerpt));
    // }
    return '';
  }
  return options.data.root.multiexcerpt[key].content || '';
};

module.exports = multiexcerpt;
