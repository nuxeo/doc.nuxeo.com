'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')('metalsmith-versions');

// npm packages
const Joi = require('joi');
const multimatch = require('multimatch');

// local packages
const get_placeholder_key = require('../get_placeholder_key');
const key_to_url = require('../key_to_url');

const schema = Joi.object().keys({
  versions: Joi.array()
    .optional()
    .items(
      Joi.object().keys({
        label: Joi.string().required(),
        is_current_version: Joi.bool()
          .optional()
          .default(false),
        url_path: Joi.string()
          .optional()
          .default('')
      })
    ),
  file_pattern: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['**/*.md', '**/*.html'])
});

const urls = function(options) {
  debug('Options: %o', options);
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    metadata.pages = metadata.pages || {};

    // Check options fits schema
    let schema_err;
    schema.validate(options, { allowUnknown: true }, function(err, value) {
      if (err) {
        error('Validation failed, %o', err.details[0].message);
        schema_err = err;
      }
      options = value;
    });
    if (schema_err) {
      return done(schema_err);
    }

    Object.keys(files).forEach(function(filepath) {
      debug('Filepath: %s', filepath);
      const file = files[filepath];
      if (multimatch(filepath, options.file_pattern).length && file.url) {
        if (options.versions && options.versions.length) {
          options.versions.forEach(function(version) {
            file.url.versions = file.url.versions || [];
            let add_item = true;
            let version_key;

            const version_item = {
              label: version.label,
              is_current_version: !!version.is_current_version
            };
            if (file.version_override && file.version_override[version.label]) {
              if (file.version_override[version.label] === 'none') {
                add_item = false;
              }
              version_key = get_placeholder_key(
                file.version_override[version.label],
                file.url.key
              );
            } else {
              const version_key_parts = [];
              version_key_parts.push(file.url.key.space);
              if (version.url_path) {
                version_key_parts.push(version.url_path);
              }
              version_key_parts.push(file.url.key.slug);
              version_key = version_key_parts.join('/');
            }

            if (add_item) {
              try {
                version_item.url = key_to_url(version_key, metadata.pages);
              } catch (e) {
                warn('Missing version %s; Title: "%s"', e.message, file.title);
                version_item.no_page = true;
                version_item.url = '/' + version_key;
              }
              file.url.versions.push(version_item);
            }
          });
          // metadata.pages[file.url.key.full] = {
          //     title: file.title,
          //     url  : file.url.full
          // };
        } else {
          debug('Ignorning: %s', filepath);
        }
        const latest_version =
          file.url &&
          file.url.versions &&
          file.url.versions.length &&
          file.url.versions.find(
            version =>
              version.label.toLowerCase() ===
              metadata.site.canonical_version_preference
          );

        if (latest_version && latest_version.url && !latest_version.no_page) {
          debug('latest', filepath, latest_version.url);
          file.url.canonical = latest_version.url;
        } else if (file.url && file.url.full) {
          debug('this_url', filepath, file.url.full);
          file.url.canonical = file.url.full;
        } else {
          error('No canonical url set', filepath);
        }
      }
    });
    return done();
  };
};

module.exports = urls;
