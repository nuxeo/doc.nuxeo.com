'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const get_placeholder_string = require('../modules/get_placeholder_string');

test('get_placeholder_string is a function', (assert) => {
  // Get typeof string
  const expected =
    get_placeholder_string && {}.toString.call(get_placeholder_string);

  assert.isEqual(
    expected,
    '[object Function]',
    'get_placeholder_string is a function'
  );
  assert.end();
});

test('get_placeholder_string returns values as expected', (assert) => {
  const string_tests = [
    {
      test: {
        name: 'useless',
      },
      expected: '',
      message: 'returns empty string when no relevant parts passed',
    },
    {
      test: {
        name: 'useless',
        page: 'install',
      },
      expected: 'install',
      message: 'returns correct name with page',
    },
    {
      test: {
        name: 'useless',
        space: 'nxdoc',
        page: 'install-1',
      },
      expected: 'nxdoc/install-1',
      message: 'returns correct name space, and page',
    },
    {
      test: {
        name: 'useless',
        version: '60',
        space: 'nxdoc',
        page: 'install-2',
      },
      expected: 'nxdoc/60/install-2',
      message: 'returns correct name, version, space, and page',
    },
    {
      test: {
        version: '',
        space: 'nxdoc',
        page: 'install-3',
      },
      expected: '/nxdoc/install-3',
      message: 'returns correct name, empty version, space, and page',
    },
    {
      test: {
        page: 'install-4',
      },
      expected: 'install-4',
      message: 'returns correct page',
    },
    {
      test: {
        page: 'nxdoc/install-5',
      },
      expected: 'nxdoc/install-5',
      message: 'returns correct space, and page',
    },
    {
      test: {
        page: 'nxdoc/1010/install-6',
      },
      expected: 'nxdoc/1010/install-6',
      message: 'returns correct version, space, and page',
    },
  ];

  string_tests.forEach((string_test) => {
    const actual = get_placeholder_string(string_test.test);
    assert.isEquivalent(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
