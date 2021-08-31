const test = require('tap').test;

const url_mangle = require('../modules/url_mangle');

test('url_mangle is a function', (assert) => {
  // Get typeof string
  const actual = url_mangle && {}.toString.call(url_mangle);

  assert.equal(actual, '[object Function]', 'url_mangle is a function');

  assert.end();
});

test('url_mangle returns value as expected', (assert) => {
  const tests = [
    {
      url: '',
      expected: '/',
      message: '/ when empty',
    },
    {
      url: 'nxdoc/index',
      expected: '/nxdoc/',
      message: 'correct URL for index pages',
    },
    {
      url: 'nxdoc/how-to-index',
      expected: '/nxdoc/how-to-index/',
      message: 'ignores index when part of the slug',
    },
  ];

  tests.forEach(({ url, expected, message }) => {
    const actual = url_mangle(url);
    assert.same(actual, expected, `Returns ${message}`);
  });

  assert.end();
});

/*
test('url_mangle returns object as expected', (assert) => {
  const url = 'git@github.com:nuxeo/doc.nuxeo.com.git';
  const actual = url_mangle(url);
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
*/
