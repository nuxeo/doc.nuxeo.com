'use strict';
/* eslint-env es6 */

const { test } = require('tap');
const fs = require('fs');
const path = require('path');
const yaml_config = require('node-yaml-config');

const site_path = path.join(process.cwd(), 'site');
const instance_config_path = path.join(process.cwd(), 'config.yml');
const instance_config = yaml_config.load(instance_config_path);

const verify_paths = (instance_config && instance_config.verify_paths) || [];

test('Key paths are present', assert => {
  assert.ok(fs.existsSync(site_path), 'site path is present');

  verify_paths.forEach(filepath => {
    assert.ok(fs.existsSync(path.join(site_path, filepath)), `${filepath} is present`);
  });

  assert.end();
});
