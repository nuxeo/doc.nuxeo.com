'use strict';
/* eslint-env es6 */

const replace_between = function (text, start, end, replacement) {
  if (typeof text === 'string' && typeof replacement === 'string') {
    return text.substring(0, start) + replacement + text.substring(end);
  }
  return text;
};

module.exports = replace_between;
