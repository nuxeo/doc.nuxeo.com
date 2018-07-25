'use strict';
/* eslint-env es6 */

// Debugging
const { warn } = require('../debugger')('handlebars-excerpt');

// local packages
const slug = require('../slug');

const excerpt = function(name, options) {
  // space:page-name
  const key_arr = name.split(':') || [options.data.root.title];
  if (key_arr.length === 1) {
    // space is missing, add to the start of the array
    key_arr.unshift(options.data.root.hierarchy.space_path);
  }
  const key = key_arr.map(slug).join('/');

  if (!options.data.root.excerpts && !options.data.root.excerpts[key]) {
    warn('"%s" is not defined. Page title: %s', key, options.data.root.title);
    return '';
  }
  return options.data.root.excerpts[key] || '';
};

module.exports = excerpt;
