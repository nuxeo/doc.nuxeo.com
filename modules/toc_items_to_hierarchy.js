'use strict';
/* eslint-env es6 */

// Debugging
const debug_lib = require('debug');
const debug = debug_lib('toc-items-to-hierarchy');
// const info = debug_lib('toc-items-to-hierarchy:info');
const error = debug_lib('toc-items-to-hierarchy:error');

const toc_items_to_hierarchy = function (items) {
    const children = [];
    let parents = [];
    items.forEach(item => {
        const {id, title} = item;
        const level = item.level - 1;
        const parent_id = parents.length - 1;
        const this_item = {
            id,
            level,
            name: title,
            url : {
                full: `#${id}`
            },
            is_toc: true
        };

        debug('id: %s, level: %s, parents: %o', id, level, parents);
        if (!parents.length || level <= parents[0].level) {
            debug('...new');
            children.push(this_item);
            parents = [this_item];
        }
        else if (level > parents[parent_id].level) {
            debug('...greater than');
            parents[parent_id].children = parents[parent_id].children || [];
            parents[parent_id].children.push(this_item);
            parents.push(this_item);
        }
        else if (level === parents[parent_id].level) {
            debug('...equal');
            parents.pop();
            parents[parents.length - 1].children.push(this_item);
            parents.push(this_item);
        }
        else if (level < parents[parent_id].level) {
            debug('...less than');
            let previous;
            do {
                previous = parents.pop();
                debug('level: %s, base: %s, previous: %s', level, parents[parents.length - 1].level, previous.level);
            } while (level >= parents[parents.length - 1].level && level < previous.level);
            parents[parents.length - 1].children.push(this_item);
            parents.push(this_item);
        }
        else {
            error('Missing case: Should not be here');
        }
    });

    return children;
};

module.exports = toc_items_to_hierarchy;
