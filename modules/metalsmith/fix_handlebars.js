'use strict';

/* eslint-env es6 */

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-fix-handlebars');
var error = debug_lib('metalsmith-fix-handlebars:error');

var co = require('co');

var replacements = [
    {
        search : /\{\{#&gt; /g,
        replace: '{{#> '
    },
    {
        search : /\{\{&gt; /g,
        replace: '{{> '
    },
    {
        search : /&#39;/g,
        replace: "'"
    },
    {
        search : /url=(['"])<a href="(.+?)(['"])(.+?)">.*?<\/a>/g,
        replace: 'url=$1$2$3$4'
    }
];

var fix_content = function (files, filepath) {
    return new Promise(function (resolve) {
        debug('Processing: %s', filepath);
        var file = files[filepath];
        var contents = file.contents.toString();
        replacements.forEach(function (replacement) {
            contents = contents.replace(replacement.search, replacement.replace);
        });
        file.contents = new Buffer(contents);
        resolve();
    });
};

/**
 * A Metalsmith plugin to extract an excerpt from Markdown files.
 *
 * @param {Object} options
 * @return {Function}
**/
var fix_handlebars = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        co(function *() {
            var file_fixes = [];
            Object.keys(files).forEach(function (filepath) {
                file_fixes.push(fix_content(files, filepath));
            });
            yield file_fixes;
            return done();
        })
        .catch(function (e) {
            error('Problem making replacement');
            return done(e);
        });
    };
};

module.exports = fix_handlebars;
