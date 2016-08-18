'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-webpack-assets');
var info = debug_lib('metalsmith-webpack-assets:info');

var webpack_assets = function (options) {

    return function (files, metalsmith, done) {
        info('Processing');
        var metadata = metalsmith.metadata();
        var stats_filepath = metalsmith.path(options.stats_file);

        debug('Stats filepath: %s', stats_filepath);
        var stats = require(stats_filepath);

        metadata.js = metadata.js || {};

        Object.keys(stats.assetsByChunkName).forEach(function (asset) {
            metadata.js[asset] = stats.publicPath + stats.assetsByChunkName[asset][0];
            debug('Name: %s; Path: %s', asset, metadata.js[asset]);
        });

        done();
    };
};

module.exports = webpack_assets;
