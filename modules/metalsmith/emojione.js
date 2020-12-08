'use strict';
/* eslint-env es6 */

// Debugging
const { debug, error } = require('../debugger')('metalsmith-emojione');

// npm packages
const Joi = require('joi');
const multimatch = require('multimatch');
const emojione = require('emojione');

const default_pattern = ['*.md', '*.html', '**/*.md', '**/*.html'];
// options schema
const schema = Joi.object()
  .keys({
    pattern: [Joi.string(), Joi.array().min(1).default(default_pattern)],
  })
  .default({
    pattern: default_pattern,
  });

const process_emojione = (options) => (files, metalsmith, done) => {
  // Check options fits schema
  const validation = schema.validate(options);
  if (validation.error) {
    error('Validation failed, %o', validation.error.details[0].message);
    return done(validation.error);
  }
  options = validation.value;

  debug('Options: %o', options);

  multimatch(Object.keys(files), options.pattern).forEach((filename) => {
    debug('Processing: %s', filename);

    const file = files[filename];
    const contents = file.contents.toString();
    let contents_emoji;
    if (~contents.indexOf(':mm:')) {
      let contents_mm = contents.replace(/:mm:/g, '^%$£mm^%$£');
      contents_emoji = emojione.toImage(contents_mm);
      contents_emoji = contents_emoji.replace(/\^%\$£mm\^%\$£/g, ':mm:');
    } else {
      contents_emoji = emojione.toImage(contents);
    }

    if (contents !== contents_emoji && contents_emoji) {
      debug('Updating with emojione: %s', filename);
      file.contents = Buffer.from(contents_emoji, 'utf8');
    }
  });

  return done();
};

module.exports = process_emojione;
