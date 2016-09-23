'use strict';
/* eslint-env es6 */

// Debugging
const {debug, error} = require('./debugger')('get-url-object');

// npm packages
const Joi = require('joi');
const path = require('path');


// validation schema
const schema = Joi.object().keys({
    spaces       : Joi.array().min(1).required(),
    version_path : Joi.string().allow('').required(),
    version_label: Joi.string().allow('').required(),
    default_space: Joi.string().required()
});

/**
 * Get url object from filepath and options
 *
 * @param   {string} filepath
 * @param   {object} options  See schema
 *
 * @returns {object}
 * full,
 * original_filepath,
 * new_filepath,
 * key: {
 *     version,
 *     space,
 *     space_path,
 *     slug,
 *     full
 * }
 */
const get_url_object = function (filepath, options) {
    if (typeof filepath !== 'string' || !filepath) {
        const error_message = 'Parameter filepath not a string or empty';
        error(`${error_message}: ${filepath}`);
        throw new Error(error_message);
    }
    // Check options fits schema
    const validation = schema.validate(options);
    if (validation.error) {
        error(`Schema validation failed: ${validation.error.details[0].message}`);
        throw validation.error;
    }
    const {spaces, version_path, version_label, default_space} = validation.value;

    const file_path_info = path.parse(filepath);
    const filepath_parts = file_path_info.dir.split(path.sep);

    const parts = [];
    const url = {
        key: {
            version   : '',
            space     : '',
            space_path: '',
            slug      : '',
            full      : ''
        },
        original_filepath: filepath
    };
    // Set the base version path
    if (version_path) {
        url.key.version = version_path;
        url.key.version_label = version_label;
        parts.push(version_path);
    }

    // Set the space path
    let space = (filepath_parts.length) ? filepath_parts.shift() : '';
    if (space) {
        url.key.space = space;
        parts.push(space);
        url.key.space_path = parts.join(path.sep);

        // Get the space_name
        const config_space = spaces.find(this_space => space === this_space.space_path);
        if (config_space && config_space.space_name) {
            url.key.space_name = config_space.space_name;
        }
        else {
            error('Missing config for space: "%s"', space);
            space = '';
        }
    }
    if (!space) {
        space = default_space;
    }


    // Set slug path
    const slug = file_path_info.name;

    // Set full url path
    const full_url_parts = parts.map(function (item) { return item; });

    if (slug === 'index') {
        if (space && !filepath_parts.length) {
            url.key.is_space_index = true;
        }
    }
    else {
        full_url_parts.push(slug);
    }
    // root only has `/`
    url.full = (full_url_parts.join(path.sep)) ? path.sep + full_url_parts.join(path.sep) + path.sep : '/';

    // Add to url.key
    if (slug) {
        url.key.slug = slug;
        parts.push(url.key.slug);
    }

    // Set full key and new_filepath
    if (parts.length && url.key.space) {
        url.key.full = parts.join(path.sep);
        url.new_filepath = url.key.full + file_path_info.ext;
    }
    else {
        url.new_filepath = url.original_filepath;
        url.key.space = default_space;
        // Not designed to work with versions without a valid space.
        // If required parts reduce and add default_space as second item
        parts.unshift(default_space);
        url.key.full = parts.join(path.sep);
        debug('Full url could not be assigned to: %s', filepath);
    }
    return url;
};

// TODO: Check the rest of the Codebase for file.slug usage

module.exports = get_url_object;
