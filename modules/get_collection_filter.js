'use strict';
/* eslint-env es6 */

// Debugging
const {debug} = require('./debugger')('get_collection_filter');

// filter function generation
const get_filter = function (filter_text = '', filter_type = 'or') {
    if (filter_text) {
        const get_field_search = definition => {
            const [field, text] = definition.split('=');
            return {
                field,
                text
            };
        };

        const remove_empty_search_text = definition => definition.text !== '';


        const filters = filter_text
            .trim()
            .replace(/, /g, ',')
            .toLowerCase()
            .split(',')
            .map(get_field_search)
            .filter(remove_empty_search_text);


        debug('filters: %o', filters);

        return row => {
            const reduce_and = (result, search) => result && !!~row[search.field].toLowerCase().indexOf(search.text);
            const reduce_or = (result, search) => result || !!~row[search.field].toLowerCase().indexOf(search.text);

            if (row) {
                if (filter_type.toLowerCase() === 'and') {
                    return filters.reduce(reduce_and, true);
                }
                else {
                    return filters.reduce(reduce_or, false);
                }
            }
            else {
                // Row is undefined - don't include
                return false;
            }
        };
    }
    else {
        return () => true;
    }
};

module.exports = get_filter;
