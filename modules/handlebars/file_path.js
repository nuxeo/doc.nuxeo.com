'use strict';
/* eslint-env es6 */

// Debugging
const { warn, error } = require('../debugger')('handlebars-file');

// npm packages
const handlebars = require('handlebars');

const get_placeholder_string = require('../get_placeholder_string');

const get_placeholder_key = require('../get_placeholder_key');
const file_url = function(options) {
  const file = options.data.root;
  const hash = options.hash || {};
  const defaults = file && file.url && file.url.key;
  const { name = '' } = hash;
  const assets = file.assets;

  const raw_page_name = get_placeholder_string(hash);

  let key = '';
  if (defaults && name) {
    key = get_placeholder_key(raw_page_name, defaults);
    if (!key) {
      warn('URL could not be processed: %s', options.hash.page, defaults);
    }
  } else {
    if (!name) {
      warn('filename not present. page: "%s"', options.hash.page);
    }
    if (!defaults) {
      warn('file.url.key not present. page: "%s", defaults: %o', options.hash.page, defaults);
    }
  }

  if (assets) {
    // Check file exists in assets object
    if (!assets[[key, name].join('/')]) {
      warn('Asset not located: "%s/%s"', key, name);
    }
  } else {
    error('Assets object is empty');
  }
  return new handlebars.SafeString(key ? '/assets/' + key + '/' + name : '');
};

module.exports = file_url;
