'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const resolve_edit_path = require('../modules/resolve_edit_path');

test('resolve_edit_path is a function', (assert) => {
  // Get typeof string
  const actual = resolve_edit_path && {}.toString.call(resolve_edit_path);

  assert.equal(actual, '[object Function]', 'resolve_edit_path is a function');

  assert.end();
});

test('resolve_edit_path returns value as expected', (assert) => {
  const url = '';
  const expected = void 0;
  const message = 'Returns undefined when nothing passed';

  const actual = resolve_edit_path(url);
  assert.same(actual, expected, message);

  assert.end();
});

test('resolve_edit_path throws errors', (assert) => {
  const url = 'https://example.com';
  const message = 'Throws error with unexpected url';

  const actual = () => resolve_edit_path(url);
  assert.throws(actual, message);

  assert.end();
});

test('resolve_edit_path returns object as expected', (assert) => {
  const url = 'git@github.com:nuxeo/doc.nuxeo.com.git';
  const actual = resolve_edit_path(url);
  assert.type(actual, 'object', 'Returns file url object');
  assert.equal(
    actual.url(),
    'https://github.com/nuxeo/doc.nuxeo.com/',
    'Returns correct url prefix'
  );
  assert.equal(
    actual.file(),
    'https://github.com/nuxeo/doc.nuxeo.com/tree/master/',
    'Returns correct url'
  );
  assert.equal(
    actual.file('static', 'src/index.md'),
    'https://github.com/nuxeo/doc.nuxeo.com/tree/static/src/index.md',
    'Returns correct url'
  );

  assert.end();
});
