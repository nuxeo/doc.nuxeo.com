const { test } = require('tap');
const path = require('path');
const { assign } = Object;

const webpack_assets_lib = require('../modules/metalsmith/webpack_assets');

const ms_path = (x) => path.join(__dirname, x);
const ms_base = {
  path: ms_path,
  _metadata: {},
  metadata: function () {
    return this._metadata;
  },
};

test('webpack_assets is a function', (assert) => {
  // Get typeof string
  const expected = webpack_assets_lib && {}.toString.call(webpack_assets_lib);

  assert.isEqual(expected, '[object Function]', 'webpack_assets is a function');
  assert.end();
});

test('webpack_assets initialisation returns a function', (assert) => {
  // Get typeof string
  const initialised = webpack_assets_lib();
  const expected = initialised && {}.toString.call(initialised);

  assert.isEqual(
    expected,
    '[object Function]',
    'webpack_assets is a function after initialisation'
  );
  assert.end();
});

test('webpack_assets errors with missing manifest', (assert) => {
  const webpack_assets = webpack_assets_lib({
    stats_file: 'fixtures/webpack_assets_manifest_missing.json',
  });

  assert.throws(webpack_assets, void 0, 'Should throw error');
  assert.end();
});

test('webpack_assets initialises with an empty object', (assert) => {
  // Get typeof string
  const webpack_assets = webpack_assets_lib({
    stats_file: 'fixtures/webpack_assets_manifest_empty.json',
  });

  const actual = assign({}, ms_base);

  const expected = assign({}, actual, {
    _metadata: {
      js: {},
    },
  });

  webpack_assets({}, actual, (err) => {
    assert.ifError(err, 'Has not errored');
    assert.isEquivalent(actual, expected, 'bundle object not added');
    assert.end();
  });
});

test('webpack_assets populates metadata accordingly', (assert) => {
  // Get typeof string
  const webpack_assets = webpack_assets_lib({
    stats_file: 'fixtures/webpack_assets_manifest.json',
  });

  const actual = assign({}, ms_base);

  const expected = assign({}, actual, {
    _metadata: {
      js: {
        docs: 'assets/js/73a6b39143936276a53f/docs.73a6b39143936276a53f.bundle.js',
        search:
          'assets/js/73a6b39143936276a53f/search.73a6b39143936276a53f.bundle.js',
        vendor: 'assets/js/73a6b39143936276a53f/vendor.bundle.js',
      },
    },
  });

  webpack_assets({}, actual, (err) => {
    assert.ifError(err, 'Has not errored');
    assert.isEquivalent(
      actual,
      expected,
      'bundle object not populated appropriately'
    );
    assert.end();
  });
});
