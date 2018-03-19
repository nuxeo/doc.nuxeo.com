'use strict';

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-css-md5');
const fs = require('fs');

const css_md5 = options => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const stats_filepath = metalsmith.path(options.stats_file);

  debug('CSS MD5 filepath: %s', stats_filepath);
  const css_md5_string = fs
    .readFileSync(stats_filepath)
    .toString()
    .split('\n')[0];

  metadata.css = metadata.css || {};
  metadata.css.md5 = css_md5_string;

  done();
};

module.exports = css_md5;
