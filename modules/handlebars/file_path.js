'use strict';
var debug_lib = require('debug');
// var debug = debug_lib('handlebars-page');
var error = debug_lib('handlebars-page:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;


var get_placeholder_key = require('../get_placeholder_key');
var file_url = function (options) {
    var file = options.data.root;
    var hash = options.hash || {};
    var defaults = file && file.url && file.url.key;
    var version = hash.version;
    var space = hash.space;
    var page = hash.page || '';
    var name = hash.name || '';
    var assets = file.assets;
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

    if (assets) {
        // Check file exists in assets object
        if (!assets[[key, name].join('/')]) {
            error('Asset not located: "%s/%s"', key, name);
        }
    }
    else {
        error('Assets object is empty');
    }

    return (key) ? '/assets/' + key + '/' + name : '';
};

module.exports = file_url;
