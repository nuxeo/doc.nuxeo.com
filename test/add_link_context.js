'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const add_link_context = require('../modules/add_link_context');

test('add_link_context is a function', assert => {
  // Get typeof string
  const expected = add_link_context && {}.toString.call(add_link_context);

  assert.isEqual(
    expected,
    '[object Function]',
    'add_link_context is a function'
  );
  assert.end();
});

test('add_link_context returns page links (without version) as expected', assert => {
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
      expected: void 0,
      message: 'returns undefined when nothing provided'
    },
    {
      test: '',
      expected: '',
      message: 'returns empty when empty'
    },
    {
      test: 'String does not contain page link',
      expected: 'String does not contain page link',
      message: 'returns same string when no page link present'
    },
    {
      test: "String contains {{file name='image.png'}} picture",
      expected:
        "String contains {{file name='image.png' page='authentication-and-user-management' space='nxdoc'}} picture",
      message: 'returns file link with context added'
    },
    {
      test: "String contains {{page page='installation'}} link",
      expected:
        "String contains {{page page='installation' space='nxdoc'}} link",
      message: 'returns page link with context added'
    },
    {
      test:
        "String contains {{page page='installation' space='admindoc'}} link",
      expected:
        "String contains {{page page='installation' space='admindoc'}} link",
      message: 'returns page link keeping existing context'
    },
    {
      test:
        "String contains {{file name='image1.png'}}{{file name='image2.png'}} picture",
      expected:
        "String contains {{file name='image1.png' page='authentication-and-user-management' space='nxdoc'}}{{file name='image2.png' page='authentication-and-user-management' space='nxdoc'}} picture",
      message: 'returns file links with context added'
    }
  ];

  string_tests.forEach(string_test => {
    const actual = add_link_context(
      string_test.test,
      string_test.fallback || fallback_values
    );
    assert.isEqual(actual, string_test.expected, string_test.message);
  });

  assert.end();
});

test('add_link_context returns page links (with version) as expected', assert => {
  const fallback_values = {
    version: '710',
    space: 'nxdoc',
    space_path: 'nxdoc',
    slug: 'authentication-and-user-management',
    parts: ['nxdoc', 'authentication-and-user-management'],
    full: 'nxdoc/authentication-and-user-management'
  };

  const string_tests = [
    {
      test: 'String does not contain page link',
      expected: 'String does not contain page link',
      message: 'returns same string when no page link present'
    },
    {
      test: "String contains {{file name='image.png'}} picture",
      expected:
        "String contains {{file name='image.png' page='authentication-and-user-management' space='nxdoc' version='710'}} picture",
      message: 'returns file link with context added'
    },
    {
      test:
        "String contains {{page page='installation' space='admindoc'}} link",
      expected:
        "String contains {{page page='installation' space='admindoc' version='710'}} link",
      message: 'returns page link with version added'
    },
    {
      test:
        "String contains {{page page='installation' space='admindoc' version='60'}} link",
      expected:
        "String contains {{page page='installation' space='admindoc' version='60'}} link",
      message: 'returns page link with existing context'
    },
    {
      test:
        "String contains {{file name='image1.png'}}{{file name='image2.png'}} picture",
      expected:
        "String contains {{file name='image1.png' page='authentication-and-user-management' space='nxdoc' version='710'}}{{file name='image2.png' page='authentication-and-user-management' space='nxdoc' version='710'}} picture",
      message: 'returns file links with context added'
    }
  ];

  string_tests.forEach(string_test => {
    const actual = add_link_context(
      string_test.test,
      string_test.fallback || fallback_values
    );
    assert.isEqual(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
