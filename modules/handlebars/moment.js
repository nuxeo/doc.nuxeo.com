'use strict';
/* eslint-env es6 */

// Debugging
const {debug, error} = require('../debugger')('handlebars-moment');

// npm packages
const moment        = require('moment');
const clone_deep    = require('lodash.clonedeep');


/**
 * Handlebars Moment Helper
 * Based upon https://www.npmjs.com/package/handlebars-helper-moment
 *
 * @param {Mixed} context - Date passed to Moment
 * @param {Mixed} block - Extra parameters in hash
 *
 * @returns {Mixed}
 */
const hb_moment = function (context, block) {
    // debug('Date passed to moment:', context);
    if (context && context.hash) {
        block = clone_deep(context);
        context = void 0;
    }
    const input_format = block.hash.input_format || ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD'];
    debug('Date passed to moment: %s, input_format: %o', context, input_format);
    delete block.hash.input_format;
    const is_output_function = [
        'format',
        'fromNow',
        'calendar',
        'diff'
    ];

    let date = (context) ? moment(context, input_format) : moment();
    let output_function_name = void 0;
    let output_function_paramater = void 0;

    // Reset the language back to default before doing anything else
    date.locale('en');

    for (let i in block.hash) {
        if (block.hash.hasOwnProperty(i)) {
            if (is_output_function.indexOf(i) !== -1) {
                output_function_name = i;
                output_function_paramater = block.hash[i];
            }
            else if (date[i]) {
                debug('Applying %s function with: %s', i, block.hash[i]);
                date = date[i](block.hash[i]);
            }
            else {
                error('moment.js does not support %s', i);
            }
        }
    }

    if (output_function_name) {
        debug('Outputting %s with: %s', output_function_name, output_function_paramater);
        date = date[output_function_name](output_function_paramater);
    }
    return date;
};

module.exports = hb_moment;
