'use strict';
/* eslint-env es6 */

const debug = require('debug')('split_outside_of_quotes');

module.exports = (str) => {
  const quote_stack = [];
  const is_quote = /["']/;
  const is_space = /\s/;
  let start_position = 0;

  return str.split('').reduce((items, chr, index, arr) => {
    const next_position = index + 1;
    debug(items, chr, index, arr);
    if (is_quote.test(chr)) {
      const last_quote = quote_stack.pop();
      if (!last_quote) {
        quote_stack.push(chr);
      } else if (last_quote !== chr) {
        quote_stack.push(last_quote);
      }
    } else if (is_space.test(chr) && !quote_stack.length) {
      const item = arr.slice(start_position, index).join('');
      debug(`Add slice: ${item}`);
      items.push(item);
      // Set start position to be the next item (ignoring the space)
      start_position = next_position;
    }
    if (next_position >= arr.length) {
      const item = arr.slice(start_position, next_position).join('');
      debug(`Add remaining ${item}`);
      items.push(item);
    }
    return items;
  }, []);
};
