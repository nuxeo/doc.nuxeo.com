'use strict';
/* eslint-env es6 */

// Debugging
const {debug} = require('../debugger')('metalsmith-toc-headers');

// npm packages
const striptags = require('striptags');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;


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

        const get_files = function (filepath) {
            debug(`Processing: ${filepath}`);
            const file = files[filepath];

            file.toc_items = [];

            const contents = file.contents.toString();

            const titles_search_criteria = ['^('];
            if (!file.toc_no_h4) {
                // Put deepest levels first
                titles_search_criteria.push('####|');
            }
            // Negative lookahead for #
            titles_search_criteria.push('###|##)(?!#)\s*(.+)$');
            const titles_find = new RegExp(titles_search_criteria.join(''), 'gm');

            let title_match;
            while ((title_match = titles_find.exec(contents)) !== null) {
                // Remove anchors
                let title = title_match[2].replace(/\{\{.+?\}\}/g, '');
                const id = slug(title.replace(/[\(\)&;\*]/g, ' '));
                const level = title_match[1].length;
                title = striptags(title.replace(/(&nbsp;)/g, ' '));
                // debug(`id: ${id}, title: ${title}, level: ${level}`);
                file.toc_items.push({id, title, level});
            }

            debug('TOC items', file.toc_items);
        };

        filepaths.forEach(get_files);
        done();
    };
};

module.exports = toc_headers;
