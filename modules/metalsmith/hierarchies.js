'use strict';
/* eslint-env es6 */

const { debug, error } = require('../debugger')('metalsmith-hierarchies');
const Joi = require('joi');
const path = require('path');
const multimatch = require('multimatch');
const multisort = require('multisort');

const run_on_tiers = require('../run_on_tiers');

const schema = Joi.object().keys({
  // versions: Joi.array().optional().items(Joi.object().keys({
  //     label             : Joi.string().required(),
  //     is_current_version: Joi.bool().optional().default(false),
  //     url_path          : Joi.string().optional().default('')
  // })),
  flatten: Joi.bool()
    .optional()
    .default(true),
  file_pattern: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['*.md', '*.html', '**/*.md', '**/*.html'])
});

const meta_hierarchies = function(options) {
  debug('Options: %o', options);
  return function(files, metalsmith, done) {
    // Check options fits schema
    const validation = schema.validate(options, { allowUnknown: true });
    if (validation.error) {
      error('Validation failed, %o', validation.error.details[0].message);
      return done(validation.error);
    }
    options = validation.value;

    const metadata = metalsmith.metadata();
    const hierarchies = {};

    Object.keys(files).forEach(filepath => {
      debug('Filepath: %s', filepath);
      const file = files[filepath];

      if (multimatch(filepath, options.file_pattern).length) {
        let file_path_info = path.parse(filepath);
        let filepath_parts = file_path_info.dir.split(path.sep);
        filepath_parts.shift();

        let space_path = file.url.key.space_path;
        let is_space_index = file.url.key.is_space_index;

        // file.hierarchy = file.hierarchy || {};

        if (space_path) {
          let current_item = (hierarchies[space_path] = hierarchies[space_path] || {
            id: space_path,
            name: '',
            url: {},
            slug: 'index',
            path: space_path,
            tree_item_index: 0,
            section_parent: '',
            children: []
          });

          if (is_space_index) {
            current_item.name = file.title;
            current_item.url = file.url;
            current_item.section_parent = file.section_parent;

            debug(`Adding parent space_path: ${space_path} key: ${file.url.key.full}, path: ${filepath}`);
          } else {
            filepath_parts.forEach(item => {
              if (current_item.children) {
                const missing_child = current_item.children.every(child => {
                  if (child.id === item) {
                    current_item = child;
                    return false;
                  }
                  return true;
                });

                if (missing_child) {
                  // No child found.
                  done(new Error('Missing parents for file: ' + filepath));
                }
              }
            });
            debug('Key: %s, path: %s', file.url.key.full, filepath_parts, current_item);

            // error('Adding: %s %s, is_space_index: %s', space_path, filepath, is_space_index, file_path_info.name);
            // Don't include hidden pages
            if (!file.hidden && !is_space_index) {
              debug(`Adding child space_path: ${space_path} key: ${file.url.key.full}, path: ${filepath}`);
              current_item.children = current_item.children || [];
              current_item.children.push({
                id: file_path_info.name,
                name: file.title,
                url: file.url,
                slug: file.slug,
                path: space_path,
                tree_item_index: file.tree_item_index,
                section_parent: file.section_parent
              });
            } else {
              debug(`Ignoring child space_path: ${space_path} key: ${file.url.key.full}, path: ${filepath}`);
            }
          }
        }
      } else {
        error('Ignorning: %s', filepath);
      }
    });
    // debug('hierarchies', hierarchies);
    // Sort
    Object.keys(hierarchies).forEach(space => {
      var hierarchy = hierarchies[space];
      // Sort each tier by tree_item_index, then slug
      run_on_tiers(hierarchy, multisort, [a => !a.tree_item_index, 'tree_item_index', 'slug']);
    });

    metadata.hierarchies = hierarchies;

    return done();
  };
};

module.exports = meta_hierarchies;
