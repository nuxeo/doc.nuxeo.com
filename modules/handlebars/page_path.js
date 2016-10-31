'use strict';
/* eslint-env es6 */

// Debugging
const {warn, error} = require('../debugger')('handlebars-page');

// npm packages
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');

const get_placeholder_string = require('../get_placeholder_string');

const page_url = function (options) {
    const file = options.data.root;
    const defaults = file && file.url && file.url.key;
    options.hash = options.hash || {};

    let {page = ''} = options.hash;
    const page_hash_split = page.split('#');
    page = page_hash_split.shift();
    let hash = (page_hash_split.length) ? page_hash_split.join('#') : '';
    hash = (hash) ? '#' + hash : hash;

    const raw_page_name = get_placeholder_string(options.hash);

    // Strip # from page
    let url = '';
    if (defaults) {
        const key = get_placeholder_key(raw_page_name, defaults);

        try {
            url = key_to_url(key, file.pages);
        }
        catch (e) {
            warn('%s; Title: "%s"', e.message, file.title);
        }
    }
    else {
        error('file.url.key not present. page: "%s", defaults: %o', options.hash.page, defaults);
    }
    return url + hash;
};

module.exports = page_url;
