'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const get_placeholder_key = require('../modules/get_placeholder_key');

test('get_placeholder_key is a function', assert => {
  // Get typeof string
  const expected = get_placeholder_key && {}.toString.call(get_placeholder_key);

  assert.isEqual(expected, '[object Function]', 'get_placeholder_key is a function');
  assert.end();
});

test('get_placeholder_key returns values as expected', assert => {
  const fallback_values = {
    version: '',
    space: 'nxdoc',
    space_path: 'nxdoc',
    slug: 'authentication-and-user-management',
    parts: ['nxdoc', 'authentication-and-user-management'],
    full: 'nxdoc/authentication-and-user-management'
  };

  const string_tests = [
    {
      test: void 0,
      expected: 'nxdoc/authentication-and-user-management',
      message: 'returns default when not a string'
    },
    {
      test: '',
      expected: 'nxdoc/authentication-and-user-management',
      message: 'returns default when empty'
    },
    {
      test: 'USERDOC:Nuxeo Diff',
      expected: 'userdoc/nuxeo-diff',
      message: 'returns correct space'
    },
    {
      test: 'SAML 2.0 Authentication',
      expected: 'nxdoc/saml-20-authentication',
      message: 'returns current space key'
    },
    {
      test: 'editing-content',
      expected: 'nxdoc/editing-content',
      message: 'returns current space key'
    },
    {
      test: 'USERDOC70:Nuxeo CSV',
      expected: 'userdoc/70/nuxeo-csv',
      message: 'returns version prefixed value'
    },
    {
      test: '70/USERDOC/Nuxeo CSV',
      expected: 'userdoc/70/nuxeo-csv',
      message: 'returns normalised version key'
    },
    {
      test: '70/USERDOC/nuxeo-csv',
      expected: 'userdoc/70/nuxeo-csv',
      message: 'returns version key'
    },
    {
      test: 'userdoc/70/nuxeo-csv',
      expected: 'userdoc/70/nuxeo-csv',
      message: 'returns version key from new format'
    },
    {
      test: 'Implementing Documentation+Items',
      expected: 'nxdoc/implementing-documentation-items',
      message: 'Correctly converts spaces and + to -'
    },
    {
      test: 'FAIL:KEY:Admin Config',
      expected: '',
      message: 'returns empty string when badly formed'
    },
    {
      test: 'index',
      expected: 'nxdoc/index',
      message: 'returns space index'
    },
    {
      test: 'userdoc/index',
      expected: 'userdoc/index',
      message: 'returns space index'
    },
    {
      test: 'index',
      expected: 'index',
      message: 'returns root index',
      fallback: {
        version: '',
        space: '',
        space_path: '',
        slug: 'index',
        parts: ['index'],
        full: 'index'
      }
    },
    {
      test: 'install',
      expected: 'nxdoc/710/install',
      message: 'returns fallback version',
      fallback: {
        version: '710',
        space: 'nxdoc',
        space_path: 'nxdoc/710',
        slug: 'index',
        parts: ['nxdoc', '710', 'index'],
        full: 'nxdoc/710/index'
      }
    },
    {
      test: 'admindoc/install',
      expected: 'admindoc/710/install',
      message: 'returns fallback version',
      fallback: {
        version: '710',
        space: 'nxdoc',
        space_path: 'nxdoc/710',
        slug: 'index',
        parts: ['nxdoc', '710', 'index'],
        full: 'nxdoc/710/index'
      }
    },
    {
      test: '/admindoc/install',
      expected: 'admindoc/install',
      message: 'Allows FT version to be applied',
      fallback: {
        version: '710',
        space: 'nxdoc',
        space_path: 'nxdoc/710',
        slug: 'index',
        parts: ['nxdoc', '710', 'index'],
        full: 'nxdoc/710/index'
      }
    }
  ];

  string_tests.forEach(string_test => {
    const actual = get_placeholder_key(string_test.test, string_test.fallback || fallback_values);
    assert.isEqual(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
