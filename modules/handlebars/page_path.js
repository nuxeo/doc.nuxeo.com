'use strict';
// var debug_lib     = require('debug');
// var debug         = debug_lib('handlebars-page');
// var error         = debug_lib('handlebars-page:error');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;

var page = function (options) {
    var url_arr = [];
    var space = options.hash.space || options.data.root.hierarchy.space_path;
    if (space) {
        url_arr.push(slug(space));
    }
    var pagename = options.hash.page;
    if (pagename) {
        url_arr.push(slug(pagename));
    }
    // TODO: Check page exists
    return '/' + url_arr.join('/') + '/';
};

module.exports = page;
