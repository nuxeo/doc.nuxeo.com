'use strict';
var debug_lib     = require('debug');
// var debug         = debug_lib('handlebars-file');
var error         = debug_lib('handlebars-file:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var file = function (options) {
    var url_arr = [];
    if (options.hash.version && options.hash.space) {
        url_arr.push(options.hash.version);
        url_arr.push(options.hash.space);
    }
    else if (options.hash.space) {
        url_arr.push(options.hash.space);
    }
    else {
        url_arr.push(options.data.root.url.key.space_path);
    }

    var pagename = options.hash.page || options.data.root.slug;
    var filename = options.hash.name;

    if (url_arr.length && pagename && filename) {
        url_arr.push(slug(pagename));
        url_arr.push(filename);
    }
    else {
        error('Missing space, page or name parameter');
        throw new Error('Missing space or page parameter');
    }
    url_arr.unshift('assets');
    // TODO: Check file exists
    return '/' + url_arr.join('/');
};

module.exports = file;
