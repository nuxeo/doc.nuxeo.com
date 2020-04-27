'use strict';

const test = require('tap').test;
const get_unique_hash = require('../modules/get_unique_hash');

test('get_unique_hash returns a function', assert => {
  // Get typeof string
  const empty_list = {};
  const get_unique_shortlink = get_unique_hash(empty_list);
  const expected =
    get_unique_shortlink && {}.toString.call(get_unique_shortlink);

  assert.isEqual(
    expected,
    '[object Function]',
    'get_unique_shortlink is a function'
  );
  assert.end();
});

test('get_unique_hash returns correct hash', assert => {
  const existing_list = {
    '/some/url/': ['d5g']
  };
  const get_unique_shortlink = get_unique_hash(existing_list);

  assert.isEqual(
    get_unique_shortlink('/abc/'),
    '2VG',
    'returns correct value when there is no conflict'
  );

  assert.isEqual(
    get_unique_shortlink('/bbc/'),
    'd5gx',
    'returns correct value when there is a conflict'
  );

  assert.end();
});
