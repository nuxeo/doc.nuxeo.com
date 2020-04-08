'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')('metalsmith-urls');

// npm packages
const Joi = require('joi');
const multimatch = require('multimatch');

// local packages
const get_url_object = require('../get_url_object');

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
          .default(''),
        menu_separator: Joi.bool()
          .optional()
          .default(false)
      })
    ),
  spaces: Joi.array()
    .optional()
    .items(
      Joi.object().keys({
        space_path: Joi.string().required(),
        space_name: Joi.string().required()
      })
    ),
  file_pattern: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['**/*.md', '**/*.html']),
  default_space: Joi.string()
    .optional()
    .default('main')
});

const urls = (options, add_to_metadata) => (files, metalsmith, done) => {
  debug('Options: %o', options);

  const metadata = metalsmith.metadata();
  metadata.pages = metadata.pages || {};

  // Check options fits schema
  const validation = schema.validate(options, { allowUnknown: true });
  if (validation.error) {
    error('Validation failed, %o', validation.error.details[0].message);
    return done(validation.error);
  }
  options = validation.value;

  let version_path = '';
  let version_label = '';
  if (options.versions) {
    const current_version = options.versions.find(
      version => version.is_current_version
    );
    if (current_version) {
      version_path = current_version.url_path;
      version_label = current_version.label;
    }
  }

  Object.entries(files).forEach(([filepath, file]) => {
    debug('Filepath: %s', filepath);
    if (multimatch(filepath, options.file_pattern).length) {
      file.url = get_url_object(filepath, {
        version_path,
        version_label,
        spaces: options.spaces,
        default_space: options.default_space
      });

      file.slug = file.url.key.slug;

      debug('Filepath: %s, url: %o', filepath, file.url.full);

      // Add to metadata.pages array
      if (add_to_metadata) {
        if (metadata.pages[file.url.key.full]) {
          warn(
            'Duplicate key found: "%s" in "%s"',
            file.url.key.full,
            file.title
          );
        } else {
          metadata.pages[file.url.key.full] = {
            title: file.title,
            url: file.url.full,
            id: file.slug,
            space: file.url.key.space,
            version: file.url.key.version,
            version_path,
            version_label,
            space_path: file.url.key.space_path,
            is_redirect: !!(file.redirect || file.redirect_source)
          };
        }
      }
    } else {
      debug('Ignorning: %s', filepath);
    }
  });
  return done();
};

module.exports = urls;
