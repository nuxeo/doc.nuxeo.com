'use strict';
/* eslint-env es6 */

const time = require('debug')('plugin-timer:time');

const timer = (title) => (f, m, done) => {
  time(`After: ${title}`);
  return done();
};

module.exports = timer;
