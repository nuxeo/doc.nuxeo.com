'use strict';
/* eslint-env es6 */

const test = require('tape');

const object_key = require('../modules/handlebars/object_key');

test('handlebars_object_key is a function', function (assert) {
    // Get typeof string
    const expected = object_key && {}.toString.call(object_key);

    assert.isEqual(expected, '[object Function]', 'object_key is a function');
    assert.end();
});

test('handlebars_object_key returns values as expected', function (assert) {
    assert.isEqual(object_key({}, ''), void 0, 'returns undefined when provided an empty object');
    assert.isEqual(object_key({hello: 'world'}, 'goodbye'), void 0, 'returns undefined when key is not present in object');
    assert.isEqual(object_key('hello', 'goodbye'), void 0, 'returns undefined when object is a string');
    assert.isEqual(object_key({hello: 'world'}, 'hello'), 'world', 'returns correct value when key is present in object');

    assert.end();
});
