'use strict';
/* eslint-env es6 */

const { test } = require('tap');
const extend = require('lodash.assign');

const get_url_object = require('../modules/get_url_object');

test('get_url_object is a function', assert => {
  // Get typeof string
  const expected = get_url_object && {}.toString.call(get_url_object);

  assert.isEqual(expected, '[object Function]', 'get_url_object is a function');
  assert.end();
});

// TODO: Test void 0 and '' filepath

test('get_url_object returns values as expected', assert => {
  const options = {
    spaces: [
      {
        space_path: 'nxdoc',
        space_name: 'Developer Documentation Center'
      },
      {
        space_path: 'userdoc',
        space_name: 'Nuxeo Platform User Documentation'
      },
      {
        space_path: 'admindoc',
        space_name: 'Nuxeo Installation and Administration'
      }
    ],
    version_path: '',
    version_label: 'FT',
    default_space: 'main'
  };

  const string_tests = [
    {
      test: 'index.md',
      expected: {
        full: '/',
        original_filepath: 'index.md',
        new_filepath: 'index.md',
        key: {
          full: 'main/index',
          is_space_index: true,
          slug: 'index',
          space: 'main',
          space_path: '',
          version: ''
        }
      }
    },
    {
      test: 'main-page.md',
      expected: {
        full: '/main-page/',
        original_filepath: 'main-page.md',
        new_filepath: 'main-page.md',
        key: {
          full: 'main/main-page',
          slug: 'main-page',
          space: 'main',
          space_path: '',
          version: ''
        }
      }
    },
    {
      test: 'nxdoc/index.md',
      expected: {
        full: '/nxdoc/',
        original_filepath: 'nxdoc/index.md',
        new_filepath: 'nxdoc/index.md',
        key: {
          full: 'nxdoc/index',
          is_space_index: true,
          slug: 'index',
          space: 'nxdoc',
          space_name: 'Developer Documentation Center',
          space_path: 'nxdoc',
          version: ''
        }
      }
    },
    {
      test: 'nxdoc/client-sdks.md',
      expected: {
        full: '/nxdoc/client-sdks/',
        original_filepath: 'nxdoc/client-sdks.md',
        new_filepath: 'nxdoc/client-sdks.md',
        key: {
          full: 'nxdoc/client-sdks',
          slug: 'client-sdks',
          space: 'nxdoc',
          space_name: 'Developer Documentation Center',
          space_path: 'nxdoc',
          version: ''
        }
      }
    },
    {
      test: 'nxdoc/tutorials/pages/acls.md',
      expected: {
        full: '/nxdoc/acls/',
        original_filepath: 'nxdoc/tutorials/pages/acls.md',
        new_filepath: 'nxdoc/acls.md',
        key: {
          full: 'nxdoc/acls',
          slug: 'acls',
          space: 'nxdoc',
          space_name: 'Developer Documentation Center',
          space_path: 'nxdoc',
          version: ''
        }
      }
    },
    {
      /* eslint no-invalid-this: 0 */
      test: 'nxdoc/tutorials/pages/acls.md',
      message: `path "${this.test}" processed correctly with version`,
      expected: {
        full: '/710/nxdoc/acls/',
        original_filepath: 'nxdoc/tutorials/pages/acls.md',
        new_filepath: '710/nxdoc/acls.md',
        key: {
          full: '710/nxdoc/acls',
          slug: 'acls',
          space: 'nxdoc',
          space_name: 'Developer Documentation Center',
          space_path: '710/nxdoc',
          version: '710',
          version_label: 'LTS 2015'
        }
      },
      options: extend({}, options, {
        version_path: '710',
        version_label: 'LTS 2015'
      })
    }
  ];

  string_tests.forEach(string_test => {
    const actual = get_url_object(string_test.test, string_test.options || options);
    assert.deepEqual(
      actual,
      string_test.expected,
      string_test.message || `path "${string_test.test}" processed correctly`
    );
  });

  assert.end();
});
