'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const webpack_assets = require('../modules/metalsmith/webpack_assets');

test('webpack_assets is a function', assert => {
  // Get typeof string
  const expected = webpack_assets && {}.toString.call(webpack_assets);

  assert.isEqual(expected, '[object Function]', 'webpack_assets is a function');
  assert.end();
});

test('webpack_assets initialisation returns a function', assert => {
  // Get typeof string
  const initialised = webpack_assets();
  const expected = initialised && {}.toString.call(initialised);

  assert.isEqual(expected, '[object Function]', 'webpack_assets is a function after initialisation');
  assert.end();
});
