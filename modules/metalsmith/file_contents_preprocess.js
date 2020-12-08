'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-file-contents-preprocess');
var error = debug_lib('metalsmith-file-contents-preprocess:error');
var each = require('async').each;
var request = require('request');
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;
var rst2mdown = require('rst2mdown');

var re_definition = /({{|\()file_content url=['"]([^'"]+)['"](}}|\))/g;

/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @return {Function}
 **/
var file_contents_preprocess = function () {
  return function (files, metalsmith, done) {
    var matches = {};
    Object.keys(files).forEach(function (filepath) {
      var file = files[filepath];
      var contents = file.contents.toString();
      var match;
      var url;

      while ((match = re_definition.exec(contents)) !== null) {
        url = match[2];
        if (url) {
          matches[filepath] = matches[filepath] || [];
          matches[filepath].push(url);
          debug('Pushed: ', filepath, url);
        }
      }
    });

    var get_files = function (filepath, callback) {
      var file = files[filepath];
      var get_file_contents = function (url, cb) {
        request(url, function (err, res, body) {
          if (err) {
            error(err);
            // Only throw if running production - allows offline dev
            if (process.env.NODE_ENV === 'production') {
              throw new Error(err);
            }
          }
          if (url.slice(-4) === '.rst') {
            body = rst2mdown(body);
          }

          file.file_content = file.file_content || {};
          file.file_content[slug(url)] = body;
          debug('Added: %s', slug(url), body);
          cb();
        });
      };
      each(matches[filepath], get_file_contents, callback);
    };

    each(Object.keys(matches), get_files, done);
  };
};

module.exports = file_contents_preprocess;
