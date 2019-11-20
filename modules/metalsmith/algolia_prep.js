// Debugging
const { debug, error } = require('./../debugger')('metalsmith-algolia-prep');

// core packages
const fs = require('fs');
const path = require('path');

// npm packages
// const cheerio = require('cheerio');
const multimatch = require('multimatch');
const Joi = require('joi');

// local packages
const url_mangle = require('../url_mangle');

// validation schema
const schema = Joi.object().keys({
  pattern: Joi.alternatives()
    .try(Joi.string(), Joi.array().min(1))
    .default('**/*.html')
});

/**
 * A Metalsmith plugin to...
 *
 * @param {Object} options
 *
 * @return {Function}
 **/
const algolia_prep = options => (files, metalsmith, done) => {
  debug('options', options);
  // Check options fits schema
  const validation = schema.validate(options);
  if (validation.error) {
    error('Validation failed, %o', validation.error.details[0].message);
    return done(validation.error);
  }
  const { pattern } = validation.value;

  const algolia_file = path.join(metalsmith.path(), 'algolia.json');

  fs.readFile(algolia_file, (err, data) => {
    if (err && err.errno !== -2) {
      return done(err);
    } else {
      error('Has data', !!data);
      const algolia = (data && JSON.parse(data)) || {};

      multimatch(Object.keys(files), pattern)
        .filter(filename => !files[filename].private)
        .filter(filename => files[filename].algolia !== false)
        .filter(filename => files[filename].title)
        .filter(
          filename =>
            files[filename] &&
            files[filename].url &&
            files[filename].url.key &&
            files[filename].url.key.full
        )
        .forEach(filename => {
          const file = files[filename];
          const description = file.description || file.excerpt || '';
          // const $ = cheerio.load(file.contents.toString() || '');
          // const $content_container = $('#content_container');
          // const $el = $content_container.length ? $content_container : $.root();
          const content = '';
          // $el
          //   .text()
          //   .replace(/×+/g, '')
          //   .replace(/\s+/g, ' ');
          const { title, ranking = 5 } = file;
          const key = file && file.url && file.url.key;
          const objectID = key.full;
          const url = url_mangle(objectID);
          // if (objectID === 'main/index' || objectID === 'main/search') {
          //   error('filename', filename, url);
          //   error('file.contents.toString()', file.contents.toString());
          //   error('content', content);
          // }
          debug('filename', filename);
          debug('objectID', objectID);
          file.algolia = true;

          if (algolia[objectID]) {
            error(`Algolia conflict: ${filename} and ${objectID}`);
          } else {
            algolia[objectID] = {
              objectID,
              title,
              description,
              ranking,
              version: key.version || 'latest',
              version_path: key.version_path,
              version_label: key.version_label,
              space: key.space,
              // key,
              // url_obj: file.url,
              url,
              content
            };
          }
        });

      // if (file.url.versions) {
      //   error(filename, (file.url.versions.find(version => version.is_current_version) || { label: '' }).label);
      // }

      const json = JSON.stringify(algolia, null, 2);

      fs.writeFile(algolia_file, json, err => {
        if (err) {
          return done(err);
        }

        done();
      });
    }
  });
};

module.exports = algolia_prep;
