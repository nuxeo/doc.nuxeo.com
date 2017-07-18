'use strict';
/* eslint-env es6 */

// Debugging
const {debug, warn} = require('../debugger')('metalsmith-toc-headers');

// npm packages
const cheerio = require('cheerio');


/**
 * A Metalsmith plugin to collect title items for TOC.
 *
 * @return {Function}
**/
const toc_headers = () => {
    return (files, metalsmith, done) => {
        // Get filepaths for files with toc only
        const filepaths = Object.keys(files).filter(filepath => files[filepath].toc);

        const get_files = (filepath) => {
            debug(`Processing: ${filepath}`);
            const file = files[filepath];

            file.toc_items = [];

            const $ = cheerio.load(file.contents.toString(), {
                decodeEntities: false
            });

            // Make ids unique
            const ids = {};
            let has_duplicate = false;
            $('*[id]').each(function () {
                /* eslint no-invalid-this: 0 */
                const $this = $(this);
                const id = $this.attr('id');
                debug(`Checking id: ${id}`);
                if (ids[id] !== void 0) {
                    $this.attr('id', id + '-' + ++ids[id]);
                    warn(`file: ${filepath} - Duplicated id: ${id}`);
                    has_duplicate = true;
                }
                else {
                    ids[id] = 0;
                }
            });
            if (has_duplicate) {
                warn(`Duplicated id in file: ${filepath}`);
                file.contents = Buffer.from($.html(), 'utf8');
            }


            const titles = ['h2', 'h3'];
            if (!file.toc_no_h4) {
                titles.push('h4');
            }
            const $titles = $(titles.join(','));

            // function definition for `this`
            $titles.each(function () {
                /* eslint no-invalid-this: 0 */
                const $this = $(this);

                const id = $this.attr('id');
                const title = $this.text().replace(/\{\{([^\}]*)\}\}/g, '');
                const level = +/\d+/.exec($this.prop('tagName').toLowerCase())[0];
                file.toc_items.push({id, title, level});
            });
            debug('Items:', file.toc_items);
        };

        filepaths.forEach(get_files);
        done();
    };
};

module.exports = toc_headers;
