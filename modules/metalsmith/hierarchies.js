'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-hierarchies');
const error = debug_lib('metalsmith-hierarchies:error');
const Joi = require('joi');
const path = require('path');
const multimatch = require('multimatch');
const multisort = require('multisort');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

const run_on_tiers = require('../run_on_tiers');

const schema = Joi.object().keys({
    versions: Joi.array().optional().items(Joi.object().keys({
        label             : Joi.string().required(),
        is_current_version: Joi.bool().optional().default(false),
        url_path          : Joi.string().optional().default('')
    })),
    flatten     : Joi.bool().optional().default(true),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

const meta_hierarchies = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {

        // Check options fits schema
        let schema_err;
        schema.validate(options, {allowUnknown: true}, function (err, value) {
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                schema_err = err;
            }
            options = value;
        });
        if (schema_err) {
            return done(schema_err);
        }

        const metadata = metalsmith.metadata();
        const hierarchies = {};
        let version_path = '';
        if (options.versions && options.versions.length) {
            options.versions.forEach(function (version) {
                version_path = (version.is_current_version) ? version.url_path : version_path;
            });
        }

        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            const file = files[filepath];

            if (multimatch(filepath, options.file_pattern).length) {

                let file_path_info = path.parse(filepath);
                let filepath_parts = file_path_info.dir.split(path.sep);
                filepath_parts.shift();

                let space_path = file.url.key.space_path;
                let is_space_index = file.url.key.is_space_index;

                // file.hierarchy = file.hierarchy || {};

                if (space_path) {
                    let current_item = hierarchies[space_path] = hierarchies[space_path] || {
                        id             : space_path,
                        name           : '',
                        url            : {},
                        slug           : '',
                        path           : space_path,
                        tree_item_index: 0
                    };

                    if (is_space_index) {
                        current_item.name = file.title;
                        current_item.url = file.url;
                    }
                    debug('Key: %s, path: %o', file.url.key.full, filepath_parts, current_item);

                    filepath_parts.forEach(function (item) {
                        let missing_node = true;
                        if (current_item.children) {
                            current_item.children.forEach(function (child) {
                                if (child.id === item) {
                                    current_item = child;
                                    missing_node = false;
                                }
                            });
                        }
                        if (missing_node) {
                            done(new Error('Missing parents for file: ' + filepath));
                        }
                    });

                    // Don't include hidden pages
                    if (!file.hidden) {
                        current_item.children = current_item.children || [];
                        current_item.children.push({
                            id             : file_path_info.name,
                            name           : file.title,
                            url            : file.url,
                            slug           : file.slug,
                            path           : space_path,
                            tree_item_index: file.tree_item_index
                        });
                    }
                }
            }
            else {
                debug('Ignorning: %s', filepath);
            }
        });
        // debug('hierarchies', hierarchies);
        // Sort
        Object.keys(hierarchies).forEach(space => {
            var hierarchy = hierarchies[space];
            // Sort each tier by tree_item_index, then slug
            run_on_tiers(hierarchy, multisort, [a => !a.tree_item_index, 'tree_item_index', 'slug']);
        });

        metadata.hierarchies = hierarchies;

        return done();
    };
};

module.exports = meta_hierarchies;
