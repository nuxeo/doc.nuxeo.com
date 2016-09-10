'use strict';
/* eslint-env es6 */

const test = require('tape');

const get_collection_filter = require('../modules/get_collection_filter');

test('get_collection_filter is a function', function (assert) {
    // Get typeof string
    const expected = get_collection_filter && {}.toString.call(get_collection_filter);

    assert.isEqual(expected, '[object Function]', 'get_collection_filter is a function');
    assert.end();
});

test('get_collection_filter returns a function', function (assert) {
    // Get typeof string
    const expected = get_collection_filter() && {}.toString.call(get_collection_filter);

    assert.isEqual(expected, '[object Function]', 'get_collection_filter() is a function');
    assert.end();
});

test('get_collection_filter returns values as expected', function (assert) {
    const collection = [
        {
            title  : 'All',
            excerpt: 'Learn how to translate things',
            topics : 'Alpha, Beta'
        },
        {
            title  : 'Has-Excerpt',
            excerpt: 'Learn how to translate the world',
            topics : ''
        },
        {
            title  : 'Has-Unique-Excerpt',
            excerpt: 'Learn how to localize words',
            topics : 'Alpha'
        },
        {
            title  : 'Has-Topics',
            excerpt: 'Nothing',
            topics : 'Alpha, Beta'
        },
        {
            title  : 'Has-Nothing',
            excerpt: '',
            topics : ''
        }
    ];

    const filter_tests = [
        {
            text    : void 0,
            type    : void 0,
            expected: ['All', 'Has-Excerpt', 'Has-Unique-Excerpt', 'Has-Topics', 'Has-Nothing'],
            message : 'returns all with no params'
        },
        {
            text    : 'excerpt=translate,topics=Alpha',
            type    : void 0,
            expected: ['All', 'Has-Excerpt', 'Has-Unique-Excerpt', 'Has-Topics'],
            message : 'returns OR by default'
        },
        {
            text    : 'excerpt=translate,topics=Alpha',
            type    : 'and',
            expected: ['All'],
            message : 'returns AND with type supplied'
        },
        {
            text    : 'excerpt=,topics=Alpha',
            type    : void 0,
            expected: ['All', 'Has-Unique-Excerpt', 'Has-Topics'],
            message : 'Ignores empty params'
        }
    ];

    filter_tests.forEach(function (filter_test) {
        const filter = get_collection_filter(filter_test.text, filter_test.type);

        // Use filter but but only test returned titles
        var actual = collection.filter(filter).map(row => row.title);
        assert.isEquivalent(actual, filter_test.expected, filter_test.message);
    });

    assert.end();
});
