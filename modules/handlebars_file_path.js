'use strict';
var debug_lib     = require('debug');
// var debug         = debug_lib('handlebars-file');
var error         = debug_lib('handlebars-file:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var file = function (options) {
    var url_arr = ['assets'];
    var space = options.hash.space || options.data.root.hierarchy.space_path;
    var pagename = options.hash.page || options.data.root.slug;
    var filename = options.hash.name;
    if (space && pagename && filename) {
        url_arr.push(slug(space));
        url_arr.push(slug(pagename));
        url_arr.push(filename);
    }
    else {
        error('Missing space, page or name parameter');
        throw new Error('Missing space or page parameter');
    }
    // TODO: Check file exists
    return '/' + url_arr.join('/');
};

module.exports = file;
