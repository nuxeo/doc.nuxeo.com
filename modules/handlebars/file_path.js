'use strict';
var debug_lib = require('debug');
// var debug = debug_lib('handlebars-page');
var error = debug_lib('handlebars-page:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var get_placeholder_key = require('../get_placeholder_key');
var page_url = function (options) {
    var defaults = options.data.root && options.data.root.url && options.data.root.url.key;
    var version = options.hash && options.hash.version;
    var space = options.hash && options.hash.space;
    var page = options.hash && options.hash.page || '';
    var name = options.hash && options.hash.name || '';
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
    var key = '';
    if (defaults && name) {
        key = get_placeholder_key(raw_page_name, defaults);
        if (!key) {
            error('URL could not be processed: %s', options.hash.page, defaults);
        }
    }
    else {
        if (!name) {
            error('filename not present. page: "%s"', options.hash.page);
        }
        if (!defaults) {
            error('file.url.key not present. page: "%s", defaults: %o', options.hash.page, defaults);
        }
    }
    // TODO: Check file exists - add all assets to metadata in pre-build and check
    return (key) ? '/assets/' + key + '/' + name : '';
};

module.exports = page_url;
