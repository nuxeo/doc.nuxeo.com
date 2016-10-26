'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('get-placeholder-object');

const equals = text => !!~text.indexOf('=');
const not_equals = text => !~text.indexOf('=');
const trim_quotes = text => (/^("[^"]*"|'[^']*')$/.test(text)) ? text.slice(1, -1) : text;

const get_key_values = (map, str) => {
    const split = str.split('=');
    map[split[0]] = trim_quotes(split[1]);
    return map;
};

const get_placeholder_object = (handlebars_style_params = '') => {
    debug(`input: ${handlebars_style_params}`);
    const all_params = handlebars_style_params
        .trim()
        .split(' ');
    const name = all_params ? trim_quotes(all_params.find(not_equals)) || '' : trim_quotes(handlebars_style_params);
    const params = all_params
        .filter(equals)
        .reduce(get_key_values, {});
    return Object.assign({name}, params);
};

module.exports = get_placeholder_object;
