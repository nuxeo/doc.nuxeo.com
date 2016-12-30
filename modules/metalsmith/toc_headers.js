'use strict';
/* eslint-env es6 */

// Debugging
// const debug_lib = require('debug');
// const debug = debug_lib('metalsmith-toc-headers');
// const error = debug_lib('metalsmith-toc-headers:error');

// npm packages
const each = require('async').each;
const cheerio = require('cheerio');


/**
 * A Metalsmith plugin to collect title items for TOC.
 *
 * @return {Function}
**/
const toc_headers = function () {
    return function (files, metalsmith, done) {
        const filepaths = Object.keys(files).filter((filepath) => {
            const file = files[filepath];
            return file.toc;
        });

        const get_files = function (filepath, callback) {
            const file = files[filepath];

            file.toc_items = [];

            const $ = cheerio.load(file.contents.toString());
            const titles = ['h2', 'h3'];
            if (!file.toc_no_h4) {
                titles.push('h4');
            }
            const $titles = $('#content').find(titles.join(', '));
            $titles.each(function () {
                /* eslint no-invalid-this: 0 */
                const $this = $(this);

                const id = $this.attr('id');
                const title = $this.text();
                const level = +/\d+/.exec($this.prop('tagName').toLowerCase())[0];
                file.toc_items.push({id, title, level});
            });
            callback();
        };

        each(filepaths, get_files, done);
    };
};

module.exports = toc_headers;
