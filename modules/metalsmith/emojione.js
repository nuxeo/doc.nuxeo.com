'use strict';
/* eslint-env es6 */

// Debugging
const module_name = 'metalsmith-emojione';
const debug_lib = require('debug');
const debug = debug_lib(module_name);
// const info = debug_lib(`${module_name}:info`);
const error = debug_lib(`${module_name}:error`);

// npm packages
const Joi = require('joi');
const multimatch = require('multimatch');
const emojione = require('emojione');

const default_pattern = ['*.md', '*.html', '**/*.md', '**/*.html'];
// options schema
const schema = Joi.object()
  .keys({
    pattern: [
      Joi.string(),
      Joi.array()
        .min(1)
        .default(default_pattern)
    ]
  })
  .default({
    pattern: default_pattern
  });

const process_emojione = function(options) {
  return function(files, metalsmith, done) {
    // Check options fits schema
    let schema_err;
    schema.validate(options, function(err, value) {
      if (err) {
        error('Validation failed, %o', err.details[0].message);
        schema_err = err;
      }
      options = value;
    });
    if (schema_err) {
      return done(schema_err);
    }
    debug('Options: %o', options);

    multimatch(Object.keys(files), options.pattern).forEach(filename => {
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
        file.contents = new Buffer(contents_emoji);
      }
    });

    return done();
  };
};

module.exports = process_emojione;
