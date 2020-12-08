'use strict';
/* eslint-env es6 */

// Debugging
const { debug, error } = require('../debugger')('metalsmith-set-description');

// npm packages
const multimatch = require('multimatch');
const Joi = require('joi');
const remove_markdown = require('remove-markdown');

// Options schema
const schema = Joi.object().keys({
  file_pattern: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['**/*.md', '**/*.html']),
});

/**
 * A Metalsmith plugin to set the description from excerpt.
 *
 * @param {Object} options
 * @return {Function}
 **/
const set_description = (options) => (files, metalsmith, done) => {
  debug('Options: %o', options);
  // Check options fits schema
  const validation = schema.validate(options);
  if (validation.error) {
    error('Validation failed, %o', validation.error.details[0].message);
    return done(validation.error);
  }
  options = validation.value;

  const metadata = metalsmith.metadata();
  metadata.excerpts = metadata.excerpts || {};

  multimatch(Object.keys(files), options.file_pattern).forEach((filepath) => {
    const file = files[filepath];

    const file_key = file.url && file.url.key && file.url.key.full;

    file.description =
      file.description ||
      remove_markdown(metadata.excerpts[file_key] || '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
  });
  return done();
};

module.exports = set_description;
