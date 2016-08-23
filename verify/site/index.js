'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var site_path = path.join(__dirname, '../../site');
var assets_path = path.join(site_path, 'assets');
var spaces = [
    'admindoc',
    'connect',
    'corg',
    'glos',
    'idedoc',
    'nxdoc',
    'studio',
    'userdoc'
];

test('site should have key files', function (assert) {
    var site_paths = [
        path.join(assets_path, 'fonts/fontawesome-webfont.ttf'),
        path.join(assets_path, 'fonts/AvenirNextLTPro/AvenirNextLTPro-Regular.ttf'),
        path.join(assets_path, 'icons/favicon.ico'),
        path.join(assets_path, 'imgs/logo340x60.png'),
        path.join(site_path, 'index.html'),
        path.join(site_path, 'index.html.gz')
    ];
    // Index of each of the spaces
    spaces.forEach(function (space) {
        site_paths.push(path.join(site_path, space + '.json'));
        site_paths.push(path.join(site_path, space, 'index.html'));
    });

    site_paths.forEach(function (filepath) {
        assert.doesNotThrow(function () { fs.accessSync(filepath, fs.F_OK); }, void 0, filepath + ' is present');
    });

    assert.end();
});

// test('key files should have content', function (assert) {
//     var css_hash = fs.readFileSync(css_stats).toString().split('\n')[0];
//     var js_obj = require(path.join('../', js_stats));
//
//     assert.ok(/^[a-z0-9]{32}$/.test(css_hash), css_stats + ' is hash of 32 characters');
//     assert.deepEqual(js_obj.errors, [], js_stats + ' has no errors');
//
//     assert.end();
// });
