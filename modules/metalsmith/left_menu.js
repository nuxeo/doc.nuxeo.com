'use strict';
/* eslint-env es6 */

// Debugging
const {debug} = require('../debugger')('metalsmith-menu');

// npm packages
const multimatch = require('multimatch');
const clone = require('lodash.clonedeep');
const {readFileSync} = require('fs');
const path = require('path');
const menu_flatten = require('../menu_flatten');
const Handlebars = require('handlebars');

const template = readFileSync(path.join(__dirname, '../../layouts/left_menu.hbs'));
debug('template', template.toString());
const build_menu = Handlebars.compile(template.toString());

// local packages
// const {init_menu, render} = require('../react/left_menu');
// const toc_items_to_hierarchy = require('../toc_items_to_hierarchy');

const menu = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();

        const matched_files = multimatch(Object.keys(files), '**/*.html');

        matched_files.forEach((filename) => {
            const file = files[filename];
            debug('filename: %s, space_path: %s', filename, file.url && file.url.key.space_path);
            let data = clone(metadata.hierarchies[file.url.key.space_path]);
            if (!file.no_side_menu && data) {
                const children_only = (file.url.key.space === 'nxdoc');

                let breadcrumbs = clone(file.hierarchy.parents);
                breadcrumbs = breadcrumbs && breadcrumbs.map(x => x.name) || [];
                breadcrumbs.push(file.title);

                const set_toggled = function (item, toggle_item) {
                    // console.log(name, 'item', item);
                    if (toggle_item) {
                        if (item.name === toggle_item) {
                            item.toggled = true;
                            if (breadcrumbs.length) {
                                if (item.children) {
                                    // console.log('children', item.children);
                                    const next_toggle_item = breadcrumbs.shift();
                                    item.children.forEach(function (child) {
                                        // console.log('child', child);
                                        set_toggled(child, next_toggle_item);
                                    });
                                }
                            }
                            else {
                                item.active = true;
                            }
                        }
                    }
                };
                set_toggled(data, breadcrumbs.shift());

                // Get first child of root
                if (data && data.children && children_only) {
                    data.children.forEach(function (node) {
                        if (node.toggled) {
                            data = node;
                        }
                    });
                }

                // Flatten data structure
                debug(`Processing: ${filename}`, data, file.toc_items);
                const menu_data = menu_flatten(data, file.toc_items);

                // Build html
                const menu_html = build_menu({menu: menu_data});

                const contents = file.contents.toString();
                file.contents = Buffer.from(contents.replace('<menu>', menu_html));
            }
        });

        done();
    };
};

module.exports = menu;
