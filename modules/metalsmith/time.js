'use strict';
/* eslint-env es6 */

const time = require('debug')('plugin-timer:time');

const timer = function (title) {
    return function (files, metalsmith, done) {
        time('After: %s', title);
        return done();
    };
};

module.exports = timer;
