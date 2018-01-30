'use strict';
/* eslint-env es6 */

// Debugging
const { debug, warn, error } = require('../debugger')('metalsmith-set-section');

// npm packages

// local packages

const Joi = require('joi');
const multimatch = require('multimatch');
const TreeModel = require('tree-model');
const tree = new TreeModel();
const trees = {};

const schema = Joi.object().keys({
  file_pattern: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['**/*.md', '**/*.html'])
});

/**
 * A Metalsmith plugin to work out which section a page is in
 *
 * @param {Object} options
 * @return {Function}
 **/
const set_section = function(options) {
  debug('Options: %o', options);
  return function(files, metalsmith, done) {
    const for_visible_pages = filepath => !files[filepath].hidden;
    const for_space_path = filepath =>
      files[filepath].url && files[filepath].url.key && files[filepath].url.key.space_path;

    // Check options fits schema
    const validation = schema.validate(options, { allowUnknown: true });
    if (validation.error) {
      error('Validation failed, %o', validation.error.details[0].message);
      return done(validation.error);
    }
    options = validation.value;

    const metadata = metalsmith.metadata();

    multimatch(Object.keys(files), options.file_pattern)
      .filter(for_visible_pages)
      .filter(for_space_path)
      .forEach(filepath => {
        const file = files[filepath];
        const space_path = file.url.key.space_path;

        debug(`file: ${filepath}, space_path: ${space_path}`);

        if (file.section_override) {
          debug(`section_override: ${file.section_override}`);
          file.section = file.section_override;
        } else if (file.section_parent) {
          debug(`section_parent: ${file.section_parent}`);
          file.section = file.section_parent;
        } else {
          const root = (trees[space_path] = trees[space_path] || tree.parse(metadata.hierarchies[space_path]));
          let node = root.first(function(item) {
            return item.model.slug === file.slug;
          });

          if (node) {
            const node_path = node.getPath();
            debug('else', node_path);

            do {
              node = node_path.pop();
              debug('node', node);
            } while (node && node.model && !node.model.section_parent);

            if (node && node.model && node.model.section_parent) {
              debug(`page section: ${node.model.section_parent}`);
              file.section = node.model.section_parent;
            } else {
              warn('No section for %s', filepath);
            }
          } else {
            done(new Error('Missing hierarchy item for file: ' + filepath));
          }
        }
      });

    return done();
  };
};

module.exports = set_section;
