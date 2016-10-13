'use strict';
/* eslint-env es6 */

// Debugging
const debug_lib = require('debug');
const debug = debug_lib('metalsmith-list-from-field');
// const error = debug_lib('metalsmith-list-from-field:error');

// npm packages
const multimatch = require('multimatch');


const list_from_details = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();
        metadata.lists = metadata.lists || {};
        const details = metadata.lists.details = metadata.lists.details || {};

        multimatch(Object.keys(files), ['*.md', '**/*.md']).forEach(filepath => {
            debug('Processing: %s', filepath);
            const file = files[filepath];
            const {version, space} = file.url.key;
            const version_space = version ? `${version}/${space}` : space;

            if (file.details && file.details) {
                Object.keys(file.details).forEach(label => {
                    const key = `${label}_${version_space}`;
                    debug('key: %s', key);
                    details[key] = details[key] || [];

                    const detail = file.details[label];
                    detail.title = file.title;
                    detail.url = file.url.full;
                    details[key].push(detail);
                });
            }
        });

        debug('details: %o', Object.keys(metadata.lists.details));

        done();
    };
};

module.exports = list_from_details;
