'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const split_outside_of_quotes = require('../modules/split_outside_of_quotes');

test('split_outside_of_quotes is a function', (assert) => {
  // Get typeof string
  const expected =
    split_outside_of_quotes && {}.toString.call(split_outside_of_quotes);

  assert.isEqual(
    expected,
    '[object Function]',
    'split_outside_of_quotes is a function'
  );
  assert.end();
});

test('split_outside_of_quotes returns values as expected', (assert) => {
  const string_tests = [
    {
      test: '',
      expected: [],
      message: 'returns empty array when nothing passed',
    },
    {
      test: 'hi',
      expected: ['hi'],
      message: 'returns single item with no spaces',
    },
    {
      test: "'hello'",
      expected: ["'hello'"],
      message: 'returns single item with quotes and no spaces',
    },
    {
      test: "'hello world'",
      expected: ["'hello world'"],
      message: 'returns single item with no valid spaces',
    },
    {
      test: "'hello' item='hi'",
      expected: ["'hello'", "item='hi'"],
      message: 'returns multiple items with valid spaces',
    },
    {
      test: "'hello' item=\"I've a quote\"",
      expected: ["'hello'", 'item="I\'ve a quote"'],
      message: 'returns multiple items with a quote',
    },
  ];

  string_tests.forEach((string_test) => {
    const actual = split_outside_of_quotes(string_test.test);
    assert.isEquivalent(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
