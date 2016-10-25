'use strict';
/* eslint-env es6 */

// true for non-lowercase characters
const is_legacy = /[^a-z\/]+/;

const is_legacy_space = str => str ? is_legacy.test(str) : false;
module.exports = is_legacy_space;
