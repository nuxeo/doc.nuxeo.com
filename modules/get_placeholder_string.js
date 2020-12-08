'use strict';
/* eslint-env es6 */

// const debug_lib = require('debug');
// const debug = debug_lib('get-placeholder-string');

const is_legacy = require('./is_legacy_space');

const get_placeholder_string = (parts) => {
  const { version, space, page = '' } = parts;

  let raw_page_name = '';

  // version and space
  if (version && space && page) {
    raw_page_name = [version, space, page].join('/');
  } else {
    // space without page - index
    const join_char = is_legacy(space) ? ':' : '/';
    if (!page && space) {
      raw_page_name = [space, 'index'].join(join_char);
    } else if (page && space) {
      raw_page_name = [space, page].join(join_char);
    } else {
      raw_page_name = page;
    }
  }
  return raw_page_name;
};

module.exports = get_placeholder_string;
