'use strict';
/* eslint-env es6 */

const { debug, info, error } = require('./../debugger')('metalsmith-nuxeo-assets');
const fs = require('fs');
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
  audio: 'src'
  // 'source': 'src'
};
const nx_assets_url_prefix = 'nx_asset://';
const nx_assets_base = 'nx_assets';

// options schema
const schema = Joi.object().keys({
  pattern: Joi.alternatives()
    .try(Joi.string(), Joi.array().min(1))
    .default('**/*.html')
});

const checksum = (str, algorithm, encoding) => {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
};

const get_attribute = el => (typeof element_mapping[el.name] !== 'undefined' ? element_mapping[el.name] : false);

const doc_assets = (options = {}) => (files, metalsmith, done) => {
  // Check options fits schema
  const validation = schema.validate(options);
  if (validation.error) {
    error(`Validation failed, ${validation.error.details[0].message}`);
    return done(validation.error);
  }
  const pattern = [].concat(validation.value.pattern);
  debug('pattern:', pattern);

  const metadata = metalsmith.metadata();

  const nuxeo_config = {
    baseURL: process.env.NX_ASSETS_URL || metadata.site.nx_assets_url || 'http://localhost:8080/nuxeo',
    auth: {
      method: 'basic',
      username: process.env.NX_ASSETS_USER || 'Administrator',
      password: process.env.NX_ASSETS_PWD || 'Administrator'
    }
  };
  debug('Nuxeo Config:', nuxeo_config);

  const nuxeo = new Nuxeo(nuxeo_config);

  const check_file = (filename, selector) =>
    new Promise((resolve, reject) => {
      debug(`Processing: ${filename}`);
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

          const p = nuxeo
            .repository()
            .fetch(uid, { schemas: ['dublincore', 'file', 'document_asset'] })
            .then(doc => {
              debug('doc:', doc);
              // if there is no file return
              if (!doc.properties['file:content']) {
                error('nx_asset without file:content');
                return null;
              }

              // build the right url
              const ext = /(?:\.([^.]+))?$/.exec(doc.properties['file:content'].name)[1];
              const asset_type = doc.properties['doc_asset:nature'];
              const asset_file = `${nx_assets_base}/${uid}+${asset_type}.${ext}`;
              const href = `/${asset_file}`;
              debug('ext:', ext);
              debug('asset_type:', asset_type);
              debug('asset_file:', asset_file);
              debug('href:', href);

              $el.attr(attr, href);
              const html = $.html();
              file.contents = Buffer.from(html, 'utf8');

              return new Promise(res => {
                fs.stat(asset_file, err => {
                  // file already exist in fs
                  if (!err) {
                    fs.readFile(asset_file, 'utf8', content => {
                      const file_digest = checksum(content, doc.properties['file:content'].digestAlgorithm);

                      // if digest matches ignore
                      if (file_digest === doc.properties['file:content'].digest) {
                        info('asset: %s already exists, ignoring', uid);
                        return res();
                      }
                    });
                  }

                  return doc.fetchRendition('docAsset').then(res => {
                    const writable = fs.createWriteStream(asset_file);
                    res.body.pipe(writable);
                    writable.on('finish', () => {
                      info('Downloaded asset: %s', uid);
                      writable.close();
                      res();
                    });
                  });
                });
              });
            })
            .catch(err => {
              error('fetch err:', err);
            });

          url_promises.push(p);
        }

        Promise.all(url_promises)
          .then(() => resolve())
          .catch(reject);
      });
    });

  const selector = Object.keys(element_mapping).join();
  const file_promises = multimatch(Object.keys(files), pattern).map(filename => check_file(filename, selector));

  Promise.all(file_promises)
    .then(() => done())
    .catch(err => {
      error(err);
      return done(err);
    });
};

// Expose `doc_assets`
module.exports = doc_assets;
