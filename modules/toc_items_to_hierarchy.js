'use strict';
/* eslint-env es6 */

// Debugging
const { debug, error } = require('./debugger')('toc-items-to-hierarchy');

const toc_items_to_hierarchy = function (items, filename = '') {
  const children = [];
  let parents = [];
  debug(`filename: ${filename}, items`, items);
  items.forEach((item) => {
    const { id, title } = item;
    const level = item.level - 1;
    const parent_id = parents.length - 1;
    const this_item = {
      id,
      level,
      name: title,
      url: {
        full: `#${id}`,
      },
      toc: true,
    };

    debug(`id: ${id}, level: ${level}, parents`, parents);
    if (!parents.length || level <= parents[0].level) {
      debug('...new');
      children.push(this_item);
      parents = [this_item];
    } else if (level > parents[parent_id].level) {
      debug('...greater than');
      parents[parent_id].children = parents[parent_id].children || [];
      parents[parent_id].children.push(this_item);
      parents.push(this_item);
    } else if (level === parents[parent_id].level) {
      debug('...equal');
      parents.pop();
      parents[parents.length - 1].children.push(this_item);
      parents.push(this_item);
    } else if (level < parents[parent_id].level) {
      debug('...less than');
      let previous;
      do {
        previous = parents.pop();
        debug(
          `level: ${level}, base: ${
            parents[parents.length - 1].level
          }, previous: ${previous.level}`
        );
      } while (
        level >= parents[parents.length - 1].level &&
        level < previous.level
      );
      parents[parents.length - 1].children.push(this_item);
      parents.push(this_item);
    } else {
      error('Missing case: Should not be here');
    }
  });

  return children;
};

module.exports = toc_items_to_hierarchy;
