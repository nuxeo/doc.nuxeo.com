'use strict';

const debug_lib = require('debug');
const debug = debug_lib('get-placeholder-key');
const error = debug_lib('get-placeholder-key:error');

const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const get_placeholder_key = (page_name_raw, defaults) => {
  const space_version_re = /^([a-z-]+)([0-9]+)?$/gi;
  let page_name_split;
  let page_name;
  const key_parts = [];
  const is_string = typeof page_name_raw === 'string';
  const is_version_re = /^\d+(\.\d+)*$/;
  debug('page_name_raw: %s', page_name_raw);
  // Legacy method
  if (is_string && ~page_name_raw.indexOf(':')) {
    page_name_split = page_name_raw.replace(/\+/g, '-').split(':');
    page_name = page_name_split.pop();

    if (page_name_split.length === 1) {
      const space_version_match = space_version_re.exec(page_name_split.pop());
      debug('space_version_match: %o', space_version_match);

      // Add version
      if (space_version_match && space_version_match[2]) {
        key_parts.push(slug(space_version_match[2]));
      }
      // Add space
      if (space_version_match && space_version_match[1]) {
        key_parts.push(slug(space_version_match[1]));
      }
    } else {
      error('Unexpected format: %s', page_name_raw);
      return '';
    }
    if (!key_parts.length) {
      key_parts.push(defaults.space_path);
    }
    key_parts.push(slug(page_name));
  } else {
    // new method
    if (!page_name_raw) {
      key_parts.push(defaults.space_path);
      key_parts.push(defaults.slug);
    } else {
      page_name_split = page_name_raw.replace(/\+/g, '-').split('/');
      // Doesn't have version space so add default
      if (page_name_split.length === 1 && defaults.space_path) {
        key_parts.push(defaults.space_path);
      } else if (page_name_split.length === 2 && defaults.version) {
        // Doesn't have version so add default
        key_parts.unshift(defaults.version);
      } else if (page_name_split.length === 3 && !page_name_split[0]) {
        // Test for blank version for full path
        page_name_split.shift();
      }
      page_name_split.map(function(item) {
        const is_version = is_version_re.test(item);
        // Versions shouldn't have . removed. E.g. "2.0" should not be "20"
        if (is_version) {
          // eslint-disable-next-line no-empty-character-class
          slug.defaults.modes.pretty.remove = /[]/g;
        }
        key_parts.push(slug(item));
        if (is_version) {
          slug.defaults.modes.pretty.remove = /[.]/g;
        }
      });
    }
  }

  // Check parts and swap first 2 if version is first
  if (key_parts.length === 3 && is_version_re.test(key_parts[0])) {
    const version = key_parts.shift();
    const space = key_parts.shift();
    key_parts.unshift(space, version);
  }

  debug('result: %s', key_parts.join('/'));
  return key_parts.join('/');
};

module.exports = get_placeholder_key;
