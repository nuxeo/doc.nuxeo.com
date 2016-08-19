'use strict';
var debug_lib = require('debug');
// var debug = debug_lib('handlebars-page');
var error = debug_lib('handlebars-page:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var get_placeholder_key = require('../get_placeholder_key');
var key_to_url = require('../key_to_url');

var page_url = function (options) {
    var file = options.data.root;
    var defaults = file && file.url && file.url.key;
    var version = options.hash && options.hash.version;
    var space = options.hash && options.hash.space;
    var page = options.hash && options.hash.page || '';
    var page_hash_split = page.split('#');
    page = page_hash_split.shift();
    var hash = (page_hash_split.length) ? page_hash_split.join('#') : '';
    hash = (hash) ? '#' + hash : hash;
    var raw_page_name = '';

    // version and space
    if (version && space && page) {
        raw_page_name = [version, space, page].join('/');
    }
    else {
        // space without page - index
        if (!page && space) {
            raw_page_name = [space, 'index'].join(':');
        }
        else if (page && space) {
            raw_page_name = [space, page].join(':');
        }
        else {
            raw_page_name = page;
        }
    }

    // Strip # from page
    var url = '';
    if (defaults) {
        var key = get_placeholder_key(raw_page_name, defaults);

        try {
            url = key_to_url(key, file.pages);
        }
        catch (e) {
            error('%o for key: "%s" in: "%s"', e, key, file.title);
        }
    }
    else {
        error('file.url.key not present. page: "%s", defaults: %o', options.hash.page, defaults);
    }
    return url + hash;
};

module.exports = page_url;
