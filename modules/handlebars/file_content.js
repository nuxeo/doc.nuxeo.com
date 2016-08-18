'use strict';
var debug_lib = require('debug');
// var debug     = debug_lib('handlebars-file_content');
var error     = debug_lib('handlebars-file_content:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var file_content = function (options) {
    var url = options.hash.url || '';
    var content = options.data.root.file_content && options.data.root.file_content[slug(url)];

    if (!content) {
        error('Content not located for: "%s" in: "%s"', url, options.data.root.title);
    }
    return (content) ? content : '';
};

module.exports = file_content;
