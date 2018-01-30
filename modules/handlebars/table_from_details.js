'use strict';
/* eslint-env es6 */

// Debugging
const { debug, error } = require('../debugger')('handlebars-table-from-details');

// npm packages
const sortby = require('lodash.sortby');

// local packages
const get_collection_filter = require('../get_collection_filter');

const table_from_details = function(options) {
  const file = options.data.root;
  const hash = options.hash || {};

  let headings = hash.headings || '';
  const spaces = hash.spaces || file.url.key.space;
  const label = hash.label || '';
  const sort_by = hash.sort_by || 'title';
  const filter_text = hash.filter || '';
  const filter_type = hash.filter_type || '';

  const remove_empty_field = text => text;

  // Put headings into an array and remove empty headings
  headings = headings
    .replace(/, /g, ',')
    .trim()
    .split(',')
    .filter(remove_empty_field);

  // Get lables with prefixes
  const labels = spaces
    .replace(/, | /g, ',')
    .trim()
    .toLowerCase()
    .split(',')
    .filter(remove_empty_field)
    .map(space => `${label}_${space}`);

  // create filter function
  const filter = get_collection_filter(filter_text, filter_type);

  let rows = [];
  if (file.lists && file.lists.details) {
    // Concat all the appropriate collections together
    labels.forEach(key => {
      if (file.lists.details[key]) {
        rows = rows.concat(file.lists.details[key]);
      }
    });

    // filter
    rows = rows.filter(filter);

    // Sort
    rows = sortby(rows, sort_by);

    // Add title_html to rows
    rows = rows.map(row => {
      debug('row: %o', row);
      row.title_html = `<a href="${row.url}">${row.title}</a>`;
      return row;
    });

    const table_pre_headings = `
        <div class="table-scroll">
        <table class="hover">
        <thead>
        <tr>
        `;
    const table_post_headings = `
        </tr>
        </thead>
        <tbody>
        `;
    const table_footer = `
        </tbody>
        </table>
        </div>
        `;

    let table = [];
    table.push(table_pre_headings);
    headings.unshift('Title');
    table = table.concat(headings.map(heading => `<th>${heading}</th>`));
    table.push(table_post_headings);

    // Switch title for html title
    headings[0] = 'title_html';

    // Get table rows and columns in arrays
    const table_rows = rows
      .map(row => {
        return headings
          .map(heading => {
            const field = heading.toLowerCase();
            return `<td>${row[field]}</td>`;
          })
          .join('\n');
      })
      .map(row => `<tr>${row}</tr>`)
      .join('\n');

    table.push(table_rows);

    table.push(table_footer);
    return table.join('\n');
  } else {
    error('No lists.details found');
    return '';
  }
};

module.exports = table_from_details;
