// Debugging
const { debug, error } = require('../debugger')('metalsmith-webpack-assets');

const webpack_assets = (options) => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const stats_filepath = metalsmith.path(options.stats_file);

  debug('Stats filepath: %s', stats_filepath);
  const stats = require(stats_filepath);

  metadata.js = metadata.js || {};

  /* istanbul ignore else: Not needed for testing */
  if (stats.assetsByChunkName) {
    Object.keys(stats.assetsByChunkName).forEach(function (asset) {
      metadata.js[asset] = stats.publicPath + stats.assetsByChunkName[asset];
      debug('Name: %s; Path: %s', asset, metadata.js[asset]);
    });
  } else {
    error('assetsByChunkName missing');
  }

  done();
};

module.exports = webpack_assets;
