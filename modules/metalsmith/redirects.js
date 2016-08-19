'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-redirects');
var error = debug_lib('metalsmith-redirects:error');
var each = require('async').each;
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var util = require('util');

var get_placeholder_key = require('../get_placeholder_key');
var key_to_url = require('../key_to_url');

var get_redirect_url = function (file, metadata) {
    var page = file.redirect_source || file.redirect || '';

    var key = (page) ? get_placeholder_key(page, file.url.key) : '';
    try {
        var url = key_to_url(key, metadata.pages);
    }
    catch (e) {
        error('%s; Title: "%s"', e.message, file.title);
    }
    return url;
};

/**
 * A Metalsmith plugin to add redirects to yaml file.
 *
 * @return {Function}
**/
var file_contents_preprocess = function () {
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        var redirects;
        var redirects_file = path.join(metalsmith.path(), 'redirects.yml');
        var finished = function (err) {
            var yaml_string = '';
            if (err) {
                return done(err);
            }
            try {
                yaml_string = yaml.safeDump(redirects, {indent: 4});
                fs.writeFileSync(redirects_file, yaml_string);
            }
            catch (e) {
                error('Redirects: %o', redirects);
                error('Problem encoding to YAML or writing file: %s', e);
                return done(new Error('YAML Conversion Failed with: ' + e + '\n\nredirects: ' + util.inspect(redirects, { showHidden: true, depth: null })));
            }
            return done(void 0);
        };

        // Get exisiting redirects
        try {
            redirects = yaml.safeLoad(fs.readFileSync(redirects_file, 'utf8')) || {};
        }
        catch (e) {
            redirects = {};
            error('Failed to load: %s: %j', redirects_file);
        }

        var matches = [];
        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];

            if (file.confluence && file.confluence.shortlink || file.redirect || file.redirect_source) {
                matches.push(filepath);
                debug('Pushed: %s with: %s', filepath, file.redirect);
            }
        });

        var add_redirect = function (filepath, callback) {
            var file = files[filepath];

            var redirect_url = '';
            if (file.redirect || file.redirect_source) {
                redirect_url = get_redirect_url(file, metadata);
            }

            if (redirect_url) {
                var this_url = get_placeholder_key('', file.url.key);
                this_url = '^/' + this_url;

                redirects[this_url] = redirect_url;
                file.layout = 'redirect.hbs';
            }
            if (file.confluence && file.confluence.shortlink) {
                if (redirect_url) {
                    redirects['^/x/' + file.confluence.shortlink] = redirect_url;
                }
                else {
                    redirects['^/x/' + file.confluence.shortlink] = file.url.full;
                }
            }

            callback();
        };

        each(matches, add_redirect, finished);
    };
};

module.exports = file_contents_preprocess;
