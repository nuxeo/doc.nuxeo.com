'use strict';
/* eslint-env es6 */

const test = require('tap').test;
const fs = require('fs');
const path = require('path');

const assets_path = path.join(__dirname, '../../assets/');
const css_stats = path.join(__dirname, '../../lib/css.md5');
const js_stats = path.join(__dirname, '../../lib/webpack.stats.json');

// console.log(fs.accessSync('./sites', fs.F_OK));

test('lib assets directory should be generated', (assert) => {

    assert.doesNotThrow(() => fs.accessSync(assets_path, fs.F_OK), './lib/assets directory is present');
    assert.doesNotThrow(() => fs.accessSync(assets_path + 'css', fs.F_OK), './lib/css directory is present');
    assert.doesNotThrow(() => fs.accessSync(assets_path + 'js', fs.F_OK), './lib/js directory is present');

    assert.end();
});

test('site should have key files', (assert) => {
    const site_paths = [
        css_stats,
        js_stats,
        `${assets_path}fonts/fontawesome-webfont.ttf`,
        `${assets_path}fonts/AvenirNextLTPro/AvenirNextLTPro-Regular.ttf`,
        `${assets_path}icons/favicon.ico`,
        `${assets_path}imgs/logo340x60.png`
    ];

    site_paths.forEach((filepath) => {
        assert.doesNotThrow(() => fs.accessSync(filepath, fs.F_OK), `${filepath} is present`);
    });

    assert.end();
});

test('key files should have content', (assert) => {
    const css_hash = fs.readFileSync(css_stats).toString().split('\n')[0];
    const js_obj = require(js_stats);

    assert.ok(/^[a-z0-9]{32}$/.test(css_hash), `${css_stats} is hash of 32 characters`);
    assert.deepEqual(js_obj.errors, [], `${js_stats} has no errors`);

    assert.end();
});
