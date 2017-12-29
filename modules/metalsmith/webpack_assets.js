'use strict';

var debug = require('debug')('metalsmith-webpack-assets');

var webpack_assets = function(options) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    var stats_filepath = metalsmith.path(options.stats_file);

    debug('Stats filepath: %s', stats_filepath);
    var stats = require(stats_filepath);

    metadata.js = metadata.js || {};

    Object.keys(stats.assetsByChunkName).forEach(function(asset) {
      metadata.js[asset] = stats.publicPath + stats.assetsByChunkName[asset][0];
      debug('Name: %s; Path: %s', asset, metadata.js[asset]);
    });

    done();
  };
};

module.exports = webpack_assets;
