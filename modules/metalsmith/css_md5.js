'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-css-md5');
var fs = require('fs');

var css_md5 = function (options) {

    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        var stats_filepath = metalsmith.path(options.stats_file);

        debug('CSS MD5 filepath: %s', stats_filepath);
        var css_md5_string = fs.readFileSync(stats_filepath).toString().split('\n')[0];

        metadata.css = metadata.css || {};
        metadata.css.md5 = css_md5_string;

        done();
    };
};

module.exports = css_md5;
