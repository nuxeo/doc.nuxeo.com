'use strict';
/* eslint-env es6 */

// Debugging
const { debug } = require('../debugger')('metalsmith-menu');

// npm packages
const multimatch = require('multimatch');
const clone = require('lodash.clonedeep');
const menu_flatten = require('../menu_flatten');

const menu = function(options) {
  debug('Options: %o', options);
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();

    const matched_files = multimatch(Object.keys(files), '**/*.html');

    matched_files.forEach(filename => {
      const file = files[filename];
      debug(
        'filename: %s, space_path: %s',
        filename,
        file.url && file.url.key.space_path
      );
      let data = clone(metadata.hierarchies[file.url.key.space_path]);
      if (!file.no_side_menu && data) {
        const children_only = file.url.key.space === 'nxdoc';

        let breadcrumbs = clone(file.hierarchy.parents);
        breadcrumbs = (breadcrumbs && breadcrumbs.map(x => x.name)) || [];
        breadcrumbs.push(file.title);

        const set_toggled = function(item, toggle_item) {
          // console.log(name, 'item', item);
          if (toggle_item) {
            if (item.name === toggle_item) {
              item.toggled = true;
              if (breadcrumbs.length) {
                if (item.children) {
                  // console.log('children', item.children);
                  const next_toggle_item = breadcrumbs.shift();
                  item.children.forEach(function(child) {
                    // console.log('child', child);
                    set_toggled(child, next_toggle_item);
                  });
                }
              } else {
                item.active = true;
              }
            }
          }
        };
        set_toggled(data, breadcrumbs.shift());

        // Get first child of root
        if (data && data.children && children_only) {
          data.children.forEach(function(node) {
            if (node.toggled) {
              data = node;
            }
          });
        }

        // Flatten data structure
        debug(`Processing: ${filename}`, data, file.toc_items);
        file.menu_data = menu_flatten(data, file.toc_items);
      }
    });

    done();
  };
};

module.exports = menu;
