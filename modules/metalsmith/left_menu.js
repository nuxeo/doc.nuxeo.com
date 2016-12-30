'use strict';
/* eslint-env es6 */

// Debugging
const debug_lib = require('debug');
const debug = debug_lib('metalsmith-menu');
// const info = debug_lib('metalsmith-menu:info');
// const error = debug_lib('metalsmith-menu:error');

// npm packages
const multimatch = require('multimatch');
const clone = require('lodash.clonedeep');

// local packages
const {init_menu, render} = require('../react/left_menu');
const toc_items_to_hierarchy = require('../toc_items_to_hierarchy');

const menu = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();

        multimatch(Object.keys(files), '**/*.html').forEach((filename) => {
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
                                item.toggled = true;
                                item.children = item.children || [];

                                // Add TOC items
                                if (file.toc_items) {
                                    debug('%s - toc: %o, toc_items: %o', file.title, file.toc, file.toc_items);
                                    const toc_hierarchy = toc_items_to_hierarchy(file.toc_items);
                                    item.children = toc_hierarchy.concat(item.children);
                                }
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

                const sideMenu = init_menu(data);

                const menu_html = render(sideMenu);
                const menu_json = `
                <script id="side-menu-data" type="text/javascript">
                    var side_menu_data = ${JSON.stringify(data)};
                </script>
                `;
                const contents = file.contents.toString();
                file.contents = Buffer.from(contents.replace('<menu>', `${menu_json}${menu_html}`));
            }
        });

        return done();
    };
};

module.exports = menu;
