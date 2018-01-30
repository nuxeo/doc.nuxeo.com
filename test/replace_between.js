'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const replace_between = require('../modules/replace_between');

test('replace_between is a function', assert => {
  // Get typeof string
  const expected = replace_between && {}.toString.call(replace_between);

  assert.isEqual(expected, '[object Function]', 'replace_between is a function');
  assert.end();
});

test('replace_between returns values as expected', assert => {
  const string_tests = [
    {
      test: void 0,
      expected: void 0,
      message: 'returns what is passed if not a string'
    },
    {
      test: '',
      expected: '',
      message: 'returns empty when empty'
    },
    {
      test: 'foo bar baz',
      from: 0,
      to: 3,
      replace: 'cat',
      expected: 'cat bar baz',
      message: 'returns replacement at start of string'
    },
    {
      test: 'foo bar baz',
      from: 4,
      to: 7,
      replace: 'cat',
      expected: 'foo cat baz',
      message: 'returns replacement at start of string'
    },
    {
      test: 'foo bar baz',
      from: 8,
      to: 11,
      replace: 'cat',
      expected: 'foo bar cat',
      message: 'returns replacement at start of string'
    }
  ];

  string_tests.forEach(string_test => {
    const actual = replace_between(string_test.test, string_test.from, string_test.to, string_test.replace);
    assert.isEqual(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
