'use strict';
/* eslint-env es6 */

const test = require('tap').test;
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const next_space_version = 'master';

const site_path = path.join(__dirname, '..', '..', 'site');
const assets_path = path.join(site_path, 'assets');
const spaces = [
  path.join('nxdoc', next_space_version),
  path.join('userdoc', next_space_version),
  'connect',
  'corg',
  'glos',
  'nxdoc',
  'studio',
  'userdoc',
];

test('site should have key files', (assert) => {
  const site_paths = [
    path.join(assets_path, 'fonts', 'fontawesome-webfont.ttf'),
    path.join(assets_path, 'icons', 'favicon.ico'),
    path.join(assets_path, 'imgs', 'logo340x60.png'),
    path.join(site_path, 'index.html'),
    path.join(site_path, 'sitemap.xml'),
    path.join(
      site_path,
      'nx_assets',
      'a26bfade-2438-4d00-a5f3-676f719ed4a8.png'
    ),
  ];
  // Index of each of the spaces
  spaces.forEach((space) => {
    site_paths.push(path.join(site_path, `${space}.json`));
    site_paths.push(path.join(site_path, space, 'index.html'));
    site_paths.push(path.join(site_path, space, 'label', 'index.html'));
  });

  site_paths.forEach((filepath) => {
    assert.doesNotThrow(() => {
      fs.accessSync(filepath, fs.F_OK);
    }, `${filepath} is present`);
  });

  assert.end();
});

test('canonical and robots metadata reference should be correct', (assert) => {
  const url_prefix = 'https://doc.nuxeo.com';
  const canonical_links = [
    {
      filepath: 'index.html',
      expected_url: '/',
      noindex: false,
    },
    {
      filepath: path.join(
        'nxdoc',
        next_space_version,
        'rest-api',
        'index.html'
      ),
      expected_url: `/nxdoc/${next_space_version}/rest-api/`,
      noindex: true,
    },
    {
      filepath: path.join('nxdoc', 'rest-api', 'index.html'),
      expected_url: '/nxdoc/rest-api/',
      noindex: false,
    },
    {
      filepath: path.join('corg', 'index.html'),
      expected_url: '/corg/',
      noindex: false,
    },
  ];

  canonical_links.forEach(({ filepath, expected_url, noindex }) => {
    const content = fs.readFileSync(path.join(site_path, filepath)).toString();
    const $ = cheerio.load(content);

    assert.isEqual(
      $('link[rel="canonical"]').attr('href'),
      `${url_prefix}${expected_url}`,
      `${filepath}: Canonical link is correct`
    );
    if (noindex) {
      assert.isEqual(
        $('meta[name="robots"]').attr('content'),
        'noindex',
        `${filepath}: Robots meta is correct`
      );
    } else {
      assert.isEqual(
        $('meta[name="robots"]').length,
        0,
        `${filepath}: Robots meta is not present`
      );
    }
  });
  assert.end();
});
