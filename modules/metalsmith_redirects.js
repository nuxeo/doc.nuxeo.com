'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-redirects');
var error = debug_lib('metalsmith-redirects:error');
var each = require('async').each;
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var util = require('util');

/**
 * A Metalsmith plugin to add redirects to yaml file.
 *
 * @return {Function}
**/
var file_contents_preprocess = function () {
    return function (files, metalsmith, done) {
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

            if (file.redirect) {
                matches.push(filepath);
                debug('Pushed: %s with: %s', filepath, file.redirect);
            }
        });

        var add_redirect = function (filepath, callback) {
            var file = files[filepath];
            var redirect_source = filepath.split('.');
            redirect_source.pop();
            redirect_source = '^/' + redirect_source.join('.');

            redirects[redirect_source] = file.redirect;
            file.layout = 'redirect.hbs';

            callback();
        };

        each(matches, add_redirect, finished);
    };
};

module.exports = file_contents_preprocess;
