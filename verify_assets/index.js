'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var assets_path = path.join(__dirname, '../assets/');
var css_stats = path.join(__dirname, '../lib/css.md5');
var js_stats = path.join(__dirname, '../lib/webpack.stats.json');

// console.log(fs.accessSync('./sites', fs.F_OK));

test('lib assets directory should be generated', function (assert) {

    assert.doesNotThrow(function () { fs.accessSync(assets_path, fs.F_OK); }, void 0, './lib/assets directory is present');
    assert.doesNotThrow(function () { fs.accessSync(assets_path + 'css', fs.F_OK); }, void 0, './lib/css directory is present');
    assert.doesNotThrow(function () { fs.accessSync(assets_path + 'js', fs.F_OK); }, void 0, './lib/js directory is present');

    assert.end();
});

test('site should have key files', function (assert) {
    var site_paths = [
        css_stats,
        js_stats,
        assets_path + 'fonts/fontawesome-webfont.ttf',
        assets_path + 'fonts/AvenirNextLTPro/AvenirNextLTPro-Regular.ttf',
        assets_path + 'icons/favicon.ico',
        assets_path + 'imgs/logo340x60.png'
    ];

    site_paths.forEach(function (filepath) {
        assert.doesNotThrow(function () { fs.accessSync(filepath, fs.F_OK); }, void 0, filepath + ' is present');
    });

    assert.end();
});

test('key files should have content', function (assert) {
    var css_hash = fs.readFileSync(css_stats).toString().split('\n')[0];
    var js_obj = require(js_stats);

    assert.ok(/^[a-z0-9]{32}$/.test(css_hash), css_stats + ' is hash of 32 characters');
    assert.deepEqual(js_obj.errors, [], js_stats + ' has no errors');

    assert.end();
});
