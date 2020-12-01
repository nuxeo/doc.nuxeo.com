'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')(
  'metalsmith-pages-from-list'
);

// npm packages
const Joi = require('joi');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const schema = Joi.array().items(
  Joi.object().keys({
    path: Joi.string().required(),
    list_key: Joi.string().required(),
    list_index_defaults: Joi.object().optional(),
    defaults: Joi.object().optional(),
  })
);

const pages_from_list = function (options) {
  debug('Options: %o', options);
  return function (files, metalsmith, done) {
    const metadata = metalsmith.metadata();

    // Check options fits schema
    schema.validate(options, function (err, value) {
      /* eslint consistent-return: 0 */
      if (err) {
        error('Validation failed, %o', err.details[0].message);
        return done(err);
      }

      options = value;
    });

    options.forEach(function (option) {
      // Expects an array or object.
      const keys =
        (metadata.lists &&
          Array.isArray(metadata.lists[option.list_key]) &&
          metadata.lists[option.list_key]) ||
        (metadata.lists && Object.keys(metadata.lists[option.list_key])) ||
        [];
      if (keys) {
        keys.forEach(function (item) {
          // if index filepath is .../index/index.md to avoid conflicts
          const filename =
            item === 'index'
              ? `${option.path}/index/index.md`
              : `${option.path}/${slug(item)}.md`;

          const data = Object.assign({}, option.defaults);
          data.title = data.title || item;
          data.list_key = option.list_key;
          data.list_item = item;
          // metalsmith expects contents.
          data.contents = data.contents || '';
          files[filename] = data;
          debug('Created: %s', filename);
        });

        // Add index file
        const filename = option.path + '.md';
        // Clone - necessary to perform pop.
        const defaults = JSON.parse(JSON.stringify(option.defaults));
        const data = Object.assign({}, defaults, option.list_index_defaults);
        // Remove last item - this is the index
        data.hierarchy.parents.pop();
        data.title = data.title || option.list_key;
        data.list_key = option.list_key;
        data.path = option.path;

        // metalsmith expects contents.
        data.contents = data.contents || '';
        files[filename] = data;
        debug('Created Index: %s', filename);
      } else {
        warn('List key is missing: %s', option.list_key);
      }
    });

    done();
  };
};

module.exports = pages_from_list;
