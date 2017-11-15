'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const get_placeholder_string = require('../modules/get_placeholder_string');

test('get_placeholder_string is a function', function (assert) {
    // Get typeof string
    const expected = get_placeholder_string && {}.toString.call(get_placeholder_string);

    assert.isEqual(expected, '[object Function]', 'get_placeholder_string is a function');
    assert.end();
});

test('get_placeholder_string returns values as expected', function (assert) {
    const string_tests = [
        {
            test: {
                name: 'useless'
            },
            expected: '',
            message : 'returns empty string when no relevant parts passed'
        },
        {
            test: {
                name: 'useless',
                page: 'install'
            },
            expected: 'install',
            message : 'returns correct name without page'
        },
        {
            test: {
                name : 'useless',
                space: 'nxdoc',
                page : 'install'
            },
            expected: 'nxdoc/install',
            message : 'returns correct name space and page'
        },
        {
            test: {
                name   : 'useless',
                version: '60',
                space  : 'nxdoc',
                page   : 'install'
            },
            expected: '60/nxdoc/install',
            message : 'returns correct name, version, space and page'
        }
    ];


    string_tests.forEach(function (string_test) {
        const actual = get_placeholder_string(string_test.test);
        assert.isEquivalent(actual, string_test.expected, string_test.message);
    });

    assert.end();
});
