'use strict';
/* eslint-env es6 */

const test = require('tape');

const hierarchy = require('../modules/metalsmith/hierarchies');

const bad_options = {
    versions: [
        {}
    ]
};
const min_options = {
    versions: [
        {
            label             : 'Fast Track',
            is_current_version: true
        },
        {
            label   : 'LTS',
            url_path: 'lts'
        }
    ]
};

test('hierarchy is a function', function (assert) {
    // Get typeof string
    const expected = hierarchy && {}.toString.call(hierarchy);

    assert.isEqual(expected, '[object Function]', 'hierarchy is a function');
    assert.end();
});

test('hierarchy() returns a function', function (assert) {
    // Get typeof string
    const expected = {}.toString.call(hierarchy());

    assert.isEqual(expected, '[object Function]', 'hierarchy is a function');
    assert.end();
});

test('hierarchy(bad_options) returns callback with error', function (assert) {
    // Get typeof string
    const hierarchy_instance = hierarchy(bad_options);

    hierarchy_instance({}, void 0, function (err) {
        assert.notEqual(err, void 0, 'should return an error');
        assert.end();
    });
});

test('hierarchy(min_options) returns a mutated "metalsmith" object with empty hierarchies', function (assert) {
    // Get typeof string
    const hierarchy_instance = hierarchy(min_options);
    const actual = {
        _metadata: {},
        metadata : function () {
            return this._metadata;
        }
    };

    const expected = {
        hierarchies: {}
    };

    hierarchy_instance({}, actual, function (err) {
        assert.error(err, 'Has not errored');
        assert.isEquivalent(actual._metadata, expected, 'Should add a hierarchy object');
        assert.end();
    });
});

test('hierarchy(min_options) returns mutated "metalsmith" object with populated hierarchies', function (assert) {
    // Get typeof string
    const hierarchy_instance = hierarchy(min_options);
    const files = {
        'nxdoc/index.md': {
            title          : 'Index Page',
            slug           : 'index',
            tree_item_index: void 0,
            url            : {
                key: {
                    space_path    : 'nxdoc',
                    is_space_index: true,
                    full          : 'nxdoc/index'
                }
            }
        }
    };
    const actual = {
        _metadata: {},
        metadata : function () {
            return this._metadata;
        }
    };

    const expected = {
        hierarchies: {
            nxdoc: {
                id             : 'nxdoc',
                name           : 'Index Page',
                path           : 'nxdoc',
                slug           : 'index',
                tree_item_index: 0,
                children       : [],
                url            : {
                    key: {
                        full          : 'nxdoc/index',
                        is_space_index: true,
                        space_path    : 'nxdoc'
                    }
                }
            }
        }
    };

    hierarchy_instance(files, actual, function (err) {
        assert.error(err, 'Has not errored');
        assert.isEquivalent(actual._metadata, expected, 'Should add a hierarchy object');
        assert.end();
    });
});
