'use strict';
/* eslint-env es6 */

const { test } = require('tap');

const normalise_git_url = require('../modules/normalise_git_url');

test('normalise_git_url is a function', assert => {
  // Get typeof string
  const expected = normalise_git_url && {}.toString.call(normalise_git_url);

  assert.isEqual(expected, '[object Function]', 'normalise_git_url is a function');
  assert.end();
});

test('normalise_git_url returns values as expected', assert => {
  const test_cases = [
    {
      message: 'Undefined returns empty string',
      preposition: void 0,
      expected: ''
    },
    {
      message: 'Should handle ssh style url',
      preposition: 'git@github.com:nuxeo/nuxeo.com.git',
      expected: 'nuxeo/nuxeo.com'
    },
    {
      message: 'Should handle https style url',
      preposition: 'https://github.com/nuxeo/nuxeo.com.git',
      expected: 'nuxeo/nuxeo.com'
    }
  ];

  test_cases.forEach(({ message, preposition, expected }) => {
    assert.isEqual(normalise_git_url(preposition), expected, message);
  });

  assert.end();
});
