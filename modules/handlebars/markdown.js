'use strict';
/* eslint-env es6 */

// const debug  = require('debug')('handlebars-markdown');
const marked = require('marked');
const handlebars = require('handlebars');

const hb_constructor = md_options => {
  const markdown = (text, options) => {
    /* eslint no-invalid-this:0 */
    if (options) {
      return marked(text || '', md_options);
    } else {
      options = text;
      return new handlebars.SafeString(marked(options.fn(this), md_options));
    }
  };
  return markdown;
};

module.exports = hb_constructor;
