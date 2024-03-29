// Debugging
const { debug, warn, error } = require('../debugger')('handlebars-page');

// npm packages
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const get_placeholder_string = require('../get_placeholder_string');
const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');

let meta_pages_log = !!process.env.META_PAGES_LOG;

const page_url = (options) => {
  const file = options.data.root;
  const defaults = file && file.url && file.url.key;
  options.hash = options.hash || {};

  // Check all branches get correct list of pages
  if (meta_pages_log) {
    meta_pages_log = false;
    const fs = require('fs');
    const moment = require('moment');

    const page_json_file = `./logs/pages-${moment().format('HH-mm-ss')}.json`;
    const json = JSON.stringify(file.pages, null, 2);

    fs.writeFile(page_json_file, json, (err) => {
      if (err) {
        error('Could NOT write ', page_json_file);
      }
    });
  }

  let { page = '' } = options.hash;

  // Strip # from page
  const page_hash_split = page.split('#');
  options.hash.page = page_hash_split.shift();
  let hash = page_hash_split.length ? page_hash_split.join('#') : '';
  hash = hash ? `#${hash}` : hash;

  const raw_page_name = get_placeholder_string(options.hash);

  let url = '';
  if (defaults) {
    const key = get_placeholder_key(raw_page_name, defaults);
    const fallback_key = get_placeholder_key(
      raw_page_name,
      Object.assign({}, defaults, { version: '' })
    );

    try {
      url = key_to_url(key, file.pages);
    } catch (e) {
      warn('%s; from path: "%s"', e.message, file.url.full);
      debug('defaults', defaults);
      debug('options.hash', options.hash);
      debug('raw_page_name', raw_page_name);
      debug('key', key);

      try {
        url = key_to_url(fallback_key, file.pages);
      } catch (e) {
        warn('%s; from fallback path: "%s"', e.message, file.url.full);
        debug('fallback_key', fallback_key);
      }
    }
  } else {
    error(
      'file.url.key not present. page: "%s", defaults: %o',
      options.hash.page,
      defaults
    );
  }
  return `${url}${hash}`;
};

module.exports = page_url;
