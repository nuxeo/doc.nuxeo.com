'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const get_placeholder_object = require('../modules/get_placeholder_object');

test('get_placeholder_object is a function', (assert) => {
  // Get typeof string
  const expected =
    get_placeholder_object && {}.toString.call(get_placeholder_object);

  assert.isEqual(
    expected,
    '[object Function]',
    'get_placeholder_object is a function'
  );
  assert.end();
});

test('get_placeholder_object returns values as expected', (assert) => {
  const string_tests = [
    {
      test: void 0,
      expected: {
        name: '',
      },
      message: 'returns empty string when nothing passed',
    },
    {
      test: '',
      expected: {
        name: '',
      },
      message: 'returns empty string when empty string passed',
    },
    {
      test: "'target_name'",
      expected: {
        name: 'target_name',
      },
      message: 'returns correct name without page',
    },
    {
      test: "'target_name' page='install'",
      expected: {
        name: 'target_name',
        page: 'install',
      },
      message: 'returns correct name without page',
    },
    {
      test: "'target_name' space='nxdoc' page='install'",
      expected: {
        name: 'target_name',
        space: 'nxdoc',
        page: 'install',
      },
      message: 'returns correct name space and page',
    },
    {
      test: "'target_name' version='60' space='nxdoc' page='install'",
      expected: {
        name: 'target_name',
        version: '60',
        space: 'nxdoc',
        page: 'install',
      },
      message: 'returns correct name, version, space and page',
    },
    {
      test: "'target_name' version='' space='nxdoc' page='install'",
      expected: {
        name: 'target_name',
        version: '',
        space: 'nxdoc',
        page: 'install',
      },
      message: 'returns correct name, version, space and page',
    },
    {
      test: " 'MP-packages-list' page='USERDOC710:Adding Features'",
      expected: {
        name: 'MP-packages-list',
        page: 'USERDOC710:Adding Features',
      },
      message: 'returns correct name, version, space and page with legacy form',
    },
  ];

  string_tests.forEach((string_test) => {
    const actual = get_placeholder_object(string_test.test);
    assert.isEquivalent(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
