'use strict';
/* eslint-env es6 */

// true if any non-lowercase characters are present
const has_upper_case = str => str ? str.toLowerCase() !== str : false;
module.exports = has_upper_case;
