'use strict';
/* eslint-env es6 */

const quote = require('quotation');
const replace_between = require('./replace_between');

const link_types = [
  {
    file_re: /\{\{ *file ([^}]+)\}\}/g,
    label: 'file',
  },
  {
    file_re: /\{\{ *page ([^}]+)\}\}/g,
    label: 'page',
  },
];
const param_re = / *([^=]+)=["'](.+?)["']/g;

const add_link_context = function (content, context) {
  const add_context_to_params = function (params) {
    const { page, space, version } = params;
    if (!page) {
      params.page = context.slug;
    }
    if (!space && context.space) {
      params.space = context.space;
    }
    if (!version && context.version) {
      params.version = context.version;
    }
    return params;
  };

  if (content) {
    link_types.forEach(function ({ file_re, label }) {
      let match;
      // Get file definitions
      while ((match = file_re.exec(content)) !== null) {
        const link = {
          full_match: match[0],
          params_raw: match[1],
          match_start: match.index,
          match_end: file_re.lastIndex,
        };
        let params = {};
        let param_match;
        while ((param_match = param_re.exec(link.params_raw)) !== null) {
          params[param_match[1]] = param_match[2];
        }
        params = add_context_to_params(params);

        // Only add params if it's in the short form
        if (!~params.page.indexOf(':') && !~params.page.indexOf('/')) {
          const params_text = Object.keys(params)
            .map((field) => `${field}=${quote(params[field], "'")}`)
            .join(' ');

          const new_link = `{{${label} ${params_text}}}`;
          file_re.lastIndex =
            file_re.lastIndex - (link.full_match.length - new_link.length);
          content = replace_between(
            content,
            link.match_start,
            link.match_end,
            new_link
          );
        }
      }
    });
  }

  return content;
};

module.exports = add_link_context;
