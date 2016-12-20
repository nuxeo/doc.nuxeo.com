'use strict';
/* eslint-env es6 */

// Debugging
const {error} = require('../debugger')('handlebars-title');

const page_title = function (url, options) {
    if (!options) {
        error('no url passed');
        return '';
    }
    const file = options.data.root;

    const page = file.pages[url.substr(1)] || file.pages[`${url.substr(1)}/index`];
    const title = page && page.title;

    if (title) {
        return title;
    }
    else {
        error('no page located for %s', url);
        return '';
    }
};

module.exports = page_title;
