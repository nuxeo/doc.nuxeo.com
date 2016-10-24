'use strict';
/* eslint-env es6 */

// Debugging
const {warn, error} = require('../debugger')('handlebars-page');

// npm packages
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');
const has_upper_case = require('../has_upper_case');

const page_url = function (options) {
    const file = options.data.root;
    const defaults = file && file.url && file.url.key;
    const version = options.hash && options.hash.version;
    const space = options.hash && options.hash.space;
    let page = options.hash && options.hash.page || '';
    const page_hash_split = page.split('#');
    page = page_hash_split.shift();
    let hash = (page_hash_split.length) ? page_hash_split.join('#') : '';
    hash = (hash) ? '#' + hash : hash;
    let raw_page_name = '';

    // version and space
    if (version && space && page) {
        raw_page_name = [version, space, page].join('/');
    }
    else {
        // space without page - index
        const join_char = (has_upper_case(space)) ? ':' : '/';
        if (!page && space) {
            raw_page_name = [space, 'index'].join(join_char);
        }
        else if (page && space) {
            raw_page_name = [space, page].join(join_char);
        }
        else {
            raw_page_name = page;
        }
    }

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
