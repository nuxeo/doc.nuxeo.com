'use strict';
var debug_lib     = require('debug');
// var debug         = debug_lib('handlebars-excerpt');
var error         = debug_lib('handlebars-excerpt:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;
var slug_map = function (str) {
    return slug(str);
};

var excerpt = function (name, options) {
    // space:page-name
    var key_arr = name.split(':') || [options.data.root.title];
    if (key_arr.length === 1) {
        // space is missing, add to the start of the array
        key_arr.unshift(options.data.root.hierarchy.space_path);
    }
    var key = key_arr.map(slug_map).join('/');

    if (!options.data.root.excerpts && !options.data.root.excerpts[key]) {
        error('"%s" is not defined. Page title: %s', key, options.data.root.title);
        return '';
    }
    return options.data.root.excerpts[key] || '';
};

module.exports = excerpt;
