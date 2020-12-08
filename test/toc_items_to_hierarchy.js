'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const toc_items_to_hierarchy = require('../modules/toc_items_to_hierarchy');

test('toc_items_to_hierarchy is a function', (assert) => {
  // Get typeof string
  const expected =
    toc_items_to_hierarchy && {}.toString.call(toc_items_to_hierarchy);

  assert.isEqual(
    expected,
    '[object Function]',
    'toc_items_to_hierarchy is a function'
  );
  assert.end();
});

test('toc_items_to_hierarchy returns values as expected', (assert) => {
  const string_tests = [
    {
      test: [],
      expected: [],
      message: 'returns empty array when nothing passed',
    },
    {
      test: [
        {
          id: 'field-bindings',
          title: 'Field Bindings',
          level: 2,
        },
      ],
      expected: [
        {
          id: 'field-bindings',
          level: 1,
          name: 'Field Bindings',
          toc: true,
          url: { full: '#field-bindings' },
        },
      ],
      message: 'returns single array item',
    },
    {
      test: [
        {
          id: 'a',
          title: 'A',
          level: 2,
        },
        {
          id: 'b',
          title: 'B',
          level: 3,
        },
        {
          id: 'c',
          title: 'C',
          level: 4,
        },
      ],
      expected: [
        {
          id: 'a',
          level: 1,
          name: 'A',
          toc: true,
          url: { full: '#a' },
          children: [
            {
              id: 'b',
              level: 2,
              name: 'B',
              toc: true,
              url: { full: '#b' },
              children: [
                {
                  id: 'c',
                  level: 3,
                  name: 'C',
                  toc: true,
                  url: { full: '#c' },
                },
              ],
            },
          ],
        },
      ],
      message: 'returns nested items',
    },
    {
      test: [
        {
          id: 'a1',
          title: 'A1',
          level: 2,
        },
        {
          id: 'b',
          title: 'B',
          level: 3,
        },
        {
          id: 'a2',
          title: 'A2',
          level: 2,
        },
      ],
      expected: [
        {
          id: 'a1',
          level: 1,
          name: 'A1',
          toc: true,
          url: { full: '#a1' },
          children: [
            {
              id: 'b',
              level: 2,
              name: 'B',
              toc: true,
              url: { full: '#b' },
            },
          ],
        },
        {
          id: 'a2',
          level: 1,
          name: 'A2',
          toc: true,
          url: { full: '#a2' },
        },
      ],
      message: 'returns root items after nesting',
    },
  ];

  string_tests.forEach((string_test) => {
    const actual = toc_items_to_hierarchy(string_test.test);
    assert.isEquivalent(actual, string_test.expected, string_test.message);
  });

  assert.end();
});
