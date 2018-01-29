'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const hierarchy = require('../modules/metalsmith/hierarchies');

test('hierarchy is a function', assert => {
  // Get typeof string
  const expected = hierarchy && {}.toString.call(hierarchy);

  assert.isEqual(expected, '[object Function]', 'hierarchy is a function');
  assert.end();
});

test('hierarchy() returns a function', assert => {
  // Get typeof string
  const expected = {}.toString.call(hierarchy());

  assert.isEqual(expected, '[object Function]', 'hierarchy is a function');
  assert.end();
});

test('hierarchy(min_options) returns a mutated "metalsmith" object with empty hierarchies', assert => {
  // Get typeof string
  const hierarchy_instance = hierarchy({});
  const actual = {
    _metadata: {},
    metadata: function() {
      return this._metadata;
    }
  };

  const expected = {
    hierarchies: {}
  };

  hierarchy_instance({}, actual, err => {
    assert.error(err, 'Has not errored');
    assert.isEquivalent(
      actual._metadata,
      expected,
      'Should add a hierarchy object'
    );
    assert.end();
  });
});

test('hierarchy({}) returns mutated "metalsmith" object with populated hierarchies', assert => {
  // Get typeof string
  const hierarchy_instance = hierarchy({});
  const files = {
    'nxdoc/index.md': {
      title: 'Index Page',
      url: {
        key: {
          space_path: 'nxdoc',
          slug: 'index',
          is_space_index: true,
          full: 'nxdoc/index'
        }
      },
      tree_item_index: void 0,
      section_parent: ''
    }
  };
  const actual = {
    _metadata: {},
    metadata: function() {
      return this._metadata;
    }
  };

  const expected = {
    hierarchies: {
      nxdoc: {
        id: 'nxdoc',
        name: 'Index Page',
        path: 'nxdoc',
        slug: 'index',
        children: [],
        url: {
          key: {
            full: 'nxdoc/index',
            slug: 'index',
            is_space_index: true,
            space_path: 'nxdoc'
          }
        },
        tree_item_index: 0,
        section_parent: ''
      }
    }
  };

  hierarchy_instance(files, actual, err => {
    assert.error(err, 'Has not errored');
    assert.isEquivalent(
      actual._metadata,
      expected,
      'Should add a hierarchy object'
    );
    assert.end();
  });
});
