'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')('metalsmith-redirects');

// npm packages
const each = require('async').each;
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const util = require('util');

const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');
const get_unique_hash = require('../get_unique_hash');

const reverse_object = obj => {
  return Object.keys(obj)
    .reverse()
    .reduce((existing, current) => {
      existing[current] = obj[current];
      return existing;
    }, {});
};

const get_redirect_url = function(file, metadata) {
  const page = file.redirect_source || file.redirect || '';
  let url;

  const key = page ? get_placeholder_key(page, file.url.key) : '';
  try {
    url = key_to_url(key, metadata.pages);
  } catch (e) {
    warn('%s; Title: "%s"', e.message, file.title);
  }
  return url;
};

const escape_regex_url = str => str.replace(/([.+])/g, '\\$1');

/**
 * A Metalsmith plugin to add redirects to yaml file.
 *
 * @return {Function}
 **/
const nuxeo_redirects = () => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const shotlinks_file = path.join(metalsmith.path(), 'shortlinks.json');
  const shortlinks = require(shotlinks_file);
  const redirects_file = path.join(metalsmith.path(), 'redirects.yml');

  const get_unique_shortlink = get_unique_hash(shortlinks);
  let redirects;

  const finished = err => {
    const shortlinks_json = JSON.stringify(shortlinks);
    let yaml_string = '';
    if (err) {
      return done(err);
    }
    try {
      yaml_string = yaml.safeDump(reverse_object(redirects), { indent: 2 });
      fs.writeFileSync(redirects_file, yaml_string);
    } catch (e) {
      error('Redirects: %o', redirects);
      error('Problem encoding to YAML or writing file: %s', e);
      return done(
        new Error(
          'YAML Conversion Failed with: ' +
            e +
            '\n\nredirects: ' +
            util.inspect(redirects, { showHidden: true, depth: null })
        )
      );
    }
    fs.writeFile(shotlinks_file, shortlinks_json, 'utf8', err => done(err));
  };

  // Get exisiting redirects
  try {
    redirects = yaml.safeLoad(fs.readFileSync(redirects_file, 'utf8')) || {};
  } catch (e) {
    redirects = {};
    if (process.env.NODE_ENV === 'production') {
      error('Failed to load: %s: %j', redirects_file);
    } else {
      warn('Failed to load: %s: %j', redirects_file);
    }
  }
  redirects = reverse_object(redirects);

  const matches = [];
  Object.keys(files).forEach(filepath => {
    const file = files[filepath];
    if (file.url) {
      const url_full = file.url.full;
      debug('url_full', url_full);

      if (!shortlinks[url_full]) {
        const shortlink = get_unique_shortlink(url_full);
        if (shortlink !== false) {
          shortlinks[url_full] = shortlink;
        } else {
          error(`Could not create unique link for: ${url_full}`);
        }
      }
      file.url.shortlink = shortlinks[url_full];
    }

    if (
      (file.confluence && file.confluence.shortlink) ||
      file.redirect ||
      file.redirect_source
    ) {
      matches.push(filepath);
      debug('Pushed: %s with: %s', filepath, file.redirect);
    }
  });

  const add_redirect = (filepath, callback) => {
    const file = files[filepath];

    let redirect_url = '';
    if (file.redirect || file.redirect_source) {
      redirect_url = get_redirect_url(file, metadata);
    }

    if (redirect_url) {
      let this_url = get_placeholder_key('', file.url.key);
      this_url = '^/' + this_url;

      redirects[this_url] = redirect_url;
      file.layout = 'redirect.hbs';
    }
    if (file.confluence && file.confluence.shortlink) {
      if (redirect_url) {
        redirects['^/x/' + file.confluence.shortlink] = redirect_url;
      } else {
        redirects['^/x/' + file.confluence.shortlink] = file.url.full;
      }
    }

    // Not /pages/viewpage.action?pageId=28475451
    if (
      file.confluence &&
      file.confluence.source_link &&
      !~file.confluence.source_link.indexOf('pages/viewpage.action?')
    ) {
      const source_url =
        '^' + escape_regex_url(file.confluence.source_link) + '/?$';

      if (redirect_url) {
        redirects[source_url] = redirect_url;
      } else {
        redirects[source_url] = file.url.full;
      }
    }

    callback();
  };

  each(matches, add_redirect, finished);
};

module.exports = nuxeo_redirects;
