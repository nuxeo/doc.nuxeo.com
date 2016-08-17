'use strict';

var test = require('tape');

var webpack_assets = require('../modules/metalsmith/webpack_assets');

test('webpack_assets is a function', function (assert) {
    // Get typeof string
    var expected = webpack_assets && {}.toString.call(webpack_assets);

    assert.isEqual(expected, '[object Function]', 'webpack_assets is a function');
    assert.end();
});

test('webpack_assets initialisation returns a function', function (assert) {
    // Get typeof string
    var initialised = webpack_assets();
    var expected = initialised && {}.toString.call(initialised);

    assert.isEqual(expected, '[object Function]', 'webpack_assets is a function after initialisation');
    assert.end();
});
