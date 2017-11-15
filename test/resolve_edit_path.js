'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const resolve_edit_path = require('../modules/resolve_edit_path');

test('resolve_edit_path is a function', function (assert) {
    // Get typeof string
    const actual = resolve_edit_path && {}.toString.call(resolve_edit_path);

    assert.isEqual(actual, '[object Function]', 'resolve_edit_path is a function');

    assert.end();
});

// test('resolve_edit_path returns values as expected', function (assert) {
//     string_tests.forEach(function (string_test) {
//         const actual = resolve_edit_path(string_test.test);
//         assert.isEquivalent(actual, string_test.expected, string_test.message);
//     });
//
//     assert.end();
// });
