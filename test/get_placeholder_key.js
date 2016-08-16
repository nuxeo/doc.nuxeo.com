'use strict';

var test = require('tape');

var get_placeholder_key = require('../modules/get_placeholder_key');

test('get_placeholder_key is a function', function (assert) {
    // Get typeof string
    var expected = get_placeholder_key && {}.toString.call(get_placeholder_key);

    assert.isEqual(expected, '[object Function]', 'get_placeholder_key is a function');
    assert.end();
});

test('get_placeholder_key returns values as expected', function (assert) {
    var fallback_values = {
        version   : '',
        space     : 'nxdoc',
        space_path: 'nxdoc',
        slug      : 'authentication-and-user-management',
        parts     : [ 'nxdoc', 'authentication-and-user-management' ],
        full      : 'nxdoc/authentication-and-user-management'
    };

    var string_tests = [
        {
            test    : void 0,
            expected: 'nxdoc/authentication-and-user-management',
            message : 'returns default when not a string'
        },
        {
            test    : '',
            expected: 'nxdoc/authentication-and-user-management',
            message : 'returns default when empty'
        },
        {
            test    : 'USERDOC:Nuxeo Diff',
            expected: 'userdoc/nuxeo-diff',
            message : 'returns correct space'
        },
        {
            test    : 'SAML 2.0 Authentication',
            expected: 'nxdoc/saml-20-authentication',
            message : 'returns current space key'
        },
        {
            test    : 'editing-content',
            expected: 'nxdoc/editing-content',
            message : 'returns current space key'
        },
        {
            test    : 'USERDOC70:Nuxeo CSV',
            expected: '70/userdoc/nuxeo-csv',
            message : 'returns version prefixed value'
        },
        {
            test    : '70/USERDOC/Nuxeo CSV',
            expected: '70/userdoc/nuxeo-csv',
            message : 'returns normalised version key'
        },
        {
            test    : '70/USERDOC/nuxeo-csv',
            expected: '70/userdoc/nuxeo-csv',
            message : 'returns version key'
        },
        {
            test    : 'FAIL:KEY:Admin Config',
            expected: '',
            message : 'returns empty string when badly formed'
        }
    ];

    string_tests.map(function (string_test) {
        var actual = get_placeholder_key(string_test.test, fallback_values);
        assert.isEqual(actual, string_test.expected, string_test.message);
    });

    // TODO: test fail states. e.g. bad form!

    assert.end();
});
