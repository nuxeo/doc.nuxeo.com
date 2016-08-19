'use strict';

/* eslint-env es6 */
module.exports = function (key, pages) {
    if (!key) {
        throw new Error('Key not provided');
    }
    else if (!pages) {
        throw new Error('Pages object not provided');
    }
    else if (!pages[key]) {
        throw new Error(`Key: "${key}" not in pages`);
    }
    else if (!pages[key].url || !pages[key].url) {
        throw new Error(`Key: "${key}" doesn't have url set`);
    }
    return pages[key].url;
};
