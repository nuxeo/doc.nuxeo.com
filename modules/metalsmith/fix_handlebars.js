'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-fix-handlebars');
const error = debug_lib('metalsmith-fix-handlebars:error');

const co = require('co');

const replacements = [
    {
        search : /\{\{#&gt; /g,
        replace: '{{#> '
    },
    {
        search : /\{\{&gt; /g,
        replace: '{{> '
    },
    {
        search : /(&#39;|&quot;)/g,
        replace: "'"
    },
    {
        search : /url=(['"])<a href="(.+?)(['"])(.+?)">.*?<\/a>/g,
        replace: 'url=$1$2$3$4'
    }
];

const fix_content = (files, filepath) => {
    return new Promise(function (resolve) {
        debug('Processing: %s', filepath);
        const file = files[filepath];
        let contents = file.contents.toString();
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
const fix_handlebars = (options) => {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        co(function *() {
            const file_fixes = [];
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
