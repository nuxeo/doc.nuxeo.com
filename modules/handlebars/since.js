'use strict';
/* eslint-env es6 */

// Debugging
const {warn} = require('../debugger')('handlebars-since');

// npm packages
const handlebars = require('handlebars');
const new_tag = new handlebars.SafeString('<span class="new-tag"></span>');

/**
 * Shows a new tag if it matches a site version variable
 *
 * @param  {mixed} identifier  version identifier
 * @param  {object} options
 *
 * @return {string}
 */
const since = (identifier, options) => {
    let return_text = '';
    if (!options) {
        // No identifier provided
        options = identifier;
        identifier = '';
    }
    const file = options.data.root;

    if (identifier) {
        if (file.site.new_version && file.site.new_version === identifier) {
            // Show new tag if a version's set and matches
            return_text = new_tag;
        }
    }
    else {
        warn(`No identifier provided for: ${options.data.root.title}`);
    }

    return return_text;
};

module.exports = since;
