'use strict';
/* eslint-env es6 */

// Debugging
const { debug, error } = require('./../debugger')('metalsmith-nuxeo-assets');

// npm packages
const Promise = require('bluebird');
const retry = require('bluebird-retry');

const fs = Promise.promisifyAll(require('fs'));
// const request = require('request');
const crypto = require('crypto');
const Joi = require('joi');
const multimatch = require('multimatch');
const Nuxeo = require('nuxeo');
const cheerio = require('cheerio');

const element_mapping = {
  // 'a'     : 'href',
  // 'link'  : 'href',
  // 'script': 'src',
  img: 'src',
  video: 'src',
  audio: 'src',
  // 'source': 'src'
};
const nx_assets_url_prefix = 'nx_asset://';
const nx_assets_base = 'nx_assets';

// options schema
const schema = Joi.object().keys({
  pattern: Joi.alternatives()
    .try(Joi.string(), Joi.array().min(1))
    .default('**/*.html'),
});

const checksum = (str, algorithm, encoding) => {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
};

const fetch = require('node-fetch');
const get_attribute = (el) =>
  typeof element_mapping[el.name] !== 'undefined'
    ? element_mapping[el.name]
    : false;

const get_file = (doc, local_path) => {
  const file_content = doc.properties['file:content'];

  return fs
    .statAsync(local_path)
    .then(
      () => fs.readFileAsync(local_path, 'utf8'),
      () => ''
    )
    .then((content) => {
      // Check file digest match otherwise get file
      const file_digest = checksum(content, file_content.digestAlgorithm);

      if (file_digest !== file_content.digest) {
        // File doesn't match, go get it.
        debug(`Getting file: ${local_path}`);

        return doc
          .fetchBlob()
          .then(
            (res) => {
              debug('Downloaded asset via Nuxeo', res);
              res.body.pipe(fs.createWriteStream(local_path));
            },
            (err) => {
              if (err && err.response) {
                return fetch(err.response.url).then((res) => {
                  debug('Downloaded asset via fetch', res);
                  res.body.pipe(fs.createWriteStream(local_path));
                });
              } else {
                debug('No err.response', err);
                return Promise.reject(err);
              }
            }
          )
          .catch((err) => {
            error('file save err: ', err);
            if (process.env.NODE_ENV !== 'development') {
              return Promise.reject(err);
            }
          });
      } else {
        return void 0;
      }
    });
};

const doc_assets = (options = {}) => (files, metalsmith, done) => {
  // Check options fits schema
  const validation = schema.validate(options);
  if (validation.error) {
    error(`Validation failed, ${validation.error.details[0].message}`);
    return done(validation.error);
  }
  const pattern = [].concat(validation.value.pattern);
  debug('pattern:', pattern);

  if (
    process.env.NODE_ENV === 'development' &&
    !process.env.NX_ASSETS_USER &&
    !process.env.NX_ASSETS_PWD
  ) {
    return done();
  }

  const metadata = metalsmith.metadata();

  const nuxeo_config = {
    baseURL:
      process.env.NX_ASSETS_URL ||
      metadata.site.nx_assets_url ||
      'http://localhost:8080/nuxeo',
    auth: {
      method: 'basic',
      username: process.env.NX_ASSETS_USER || 'Administrator',
      password: process.env.NX_ASSETS_PWD || 'Administrator',
    },
  };
  debug('Nuxeo Config:', nuxeo_config);

  const nuxeo = new Nuxeo(nuxeo_config);
  const repo = nuxeo.repository();

  const check_file = (filename, selector) => {
    const file = files[filename];

    const contents = file.contents.toString();
    const $ = cheerio.load(contents);

    const url_promises = [];

    $(selector).each((i, el) => {
      const $el = $(el);
      const attr = get_attribute(el);
      const url = $el.attr(attr);
      if (url && url.startsWith(nx_assets_url_prefix)) {
        const uid = url.slice(nx_assets_url_prefix.length);
        debug(`uid: ${uid}`);

        const p = retry(repo.fetch.bind(repo), {
          max_tries: 5,
          interval: 500,
          throw_original: true,
          args: [uid, { schemas: ['dublincore', 'file', 'document_asset'] }],
        })
          .then((doc) => {
            debug('doc:', doc);
            // if there is no file return
            if (!doc.properties['file:content']) {
              error('nx_asset without file:content');
              return null;
            }

            // build the right url
            const ext = /(?:\.([^.]+))?$/.exec(
              doc.properties['file:content'].name
            )[1];
            const asset_type = doc.properties['doc_asset:nature'];
            const asset_file = `${nx_assets_base}/${uid}-${asset_type}.${ext}`;
            const href = `/${asset_file}`;
            debug('ext:', ext);
            debug('asset_type:', asset_type);
            debug('asset_file:', asset_file);
            debug('href:', href);

            // Update the href in the DOM
            $el.attr(attr, href);
            const html = $.html();
            file.contents = Buffer.from(html, 'utf8');

            return get_file(doc, asset_file);
          })
          .catch((err) => {
            error('fetch err:', err);
            return Promise.reject(err);
          });

        url_promises.push(p);
      }
    });

    return Promise.all(url_promises);
  };

  const selector = Object.keys(element_mapping).join();
  const file_promises = multimatch(
    Object.keys(files),
    pattern
  ).map((filename) => check_file(filename, selector));

  Promise.all(file_promises)
    .then(() => done())
    .catch((err) => {
      error('file promises error', err);
      return done(err);
    });
};

// Expose `doc_assets`
module.exports = doc_assets;
