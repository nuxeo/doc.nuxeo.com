const test = require('tap').test;

const key_to_url = require('../modules/key_to_url');

const default_pages = {
  index: { url: '/' },
  'path/with/slashes': { url: '/path/with/slashes' },
  'missing/url': {},
  'file/with/redirect': { redirect: '/' },
};

test('key_to_url is a function', (assert) => {
  // Get typeof string
  const expected = key_to_url && {}.toString.call(key_to_url);

  assert.isEqual(expected, '[object Function]', 'key_to_url is a function');
  assert.end();
});

test('key_to_url errors appropriately', (assert) => {
  const tests = [
    {
      message: 'Throws with no key provided',
      key: void 0,
      pages: default_pages,
      expected: 'Key not provided',
    },
    {
      message: 'Throws with no pages object provided',
      key: 'index',
      pages: void 0,
      expected: 'Pages object not provided',
    },
    {
      message: 'Throws with no key is found',
      key: 'missing/page',
      pages: default_pages,
      expected: 'Key: "missing/page" not in pages',
    },
    {
      message: 'Throws with no url property',
      key: 'missing/url',
      pages: default_pages,
      expected: 'Key: "missing/url" doesn\'t have url set',
    },
    {
      message: 'Throws when target is a redirect',
      key: 'file/with/redirect',
      pages: default_pages,
      expected: 'Key: "file/with/redirect" doesn\'t have url set',
    },
  ];

  tests.forEach(({ message, key, pages, expected }) =>
    assert.throws(() => key_to_url(key, pages), new Error(expected), message)
  );
  assert.end();
});

test('key_to_url responds appropriately', (assert) => {
  const tests = [
    {
      message: 'Returns url for index',
      key: 'index',
      pages: default_pages,
      expected: '/',
    },
    {
      message: 'Returns url for path with slashes',
      key: 'path/with/slashes',
      pages: default_pages,
      expected: '/path/with/slashes',
    },
  ];

  tests.forEach(({ message, key, pages, expected }) =>
    assert.equals(key_to_url(key, pages), expected, message)
  );
  assert.end();
});
