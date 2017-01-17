'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-hierarchy');
const error = debug_lib('metalsmith-hierarchy:error');
const Joi = require('joi');
// const path = require('path');
const multimatch = require('multimatch');
const TreeModel = require('tree-model');
const tree = new TreeModel();
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;
const trees = {};

const schema = Joi.object().keys({
    versions: Joi.array().optional().items(Joi.object().keys({
        label             : Joi.string().required(),
        is_current_version: Joi.bool().optional().default(false),
        url_path          : Joi.string().optional().default('')
    })),
    flatten     : Joi.bool().optional().default(true),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

const hierarchy = function (options) {
    /* eslint guard-for-in:0 */
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        // Check options fits schema
        const validation = schema.validate(options, {allowUnknown: true});
        if (validation.error) {
            error('Validation failed, %o', validation.error.details[0].message);
            return done(validation.error);
        }
        options = validation.value;

        const metadata = metalsmith.metadata();

        const hierarchies = metadata.hierarchies;

        // Add hierarchy to files and flatten
        Object.keys(files).forEach(function (filepath) {
            const file = files[filepath];
            const space_path = file.url.key.space_path;
            file.hierarchy = file.hierarchy || {};

            if (multimatch(filepath, options.file_pattern).length && space_path) {
                // Don't include hidden pages
                if (!file.hidden) {
                    const root = trees[space_path] = trees[space_path] || tree.parse(hierarchies[space_path]);

                    let node = root.first(function (item) {
                        return item.model.slug === file.slug;
                    });
                    const is_root = node.isRoot();
                    if (!node) {
                        done(new Error('Missing hierarchy item for file: ' + filepath));
                    }
                    const node_path = node.getPath();
                    // error('Node Path: %o', node_path);

                    // Add breadcrumbs
                    file.hierarchy.parents = [];
                    for (let i = 0; i < node_path.length - 1; i++) {
                        file.hierarchy.parents.push({
                            url : node_path[i].model.url.full,
                            name: node_path[i].model.name
                        });
                        // error('Node Element: %o', node_path[i].model.id);
                    }

                    // Add children
                    node = node_path.pop();
                    file.hierarchy.children = [];
                    for (let i = 0; i < node.children.length; i++) {
                        file.hierarchy.children.push({
                            url : node.children[i].model.url.full,
                            name: node.children[i].model.name
                        });
                    }
                    // Add siblings
                    node = node_path.pop();
                    file.hierarchy.siblings = [];
                    let found_myself = false;
                    // error('File slug: %s', file.slug);
                    if (!is_root) {
                        for (let i = 0; i < node.children.length; i++) {
                            if (node.children[i].model.slug !== file.slug) {
                                file.hierarchy.siblings.push({
                                    url : node.children[i].model.url.full,
                                    name: node.children[i].model.name
                                });
                            }
                            else {
                                found_myself = true;
                            }
                        }
                        if (!found_myself) {
                            const problem_list = [];
                            for (let i = 0; i < file.hierarchy.siblings.length; i++) {
                                problem_list.push(file.hierarchy.siblings[i].slug);
                            }
                            done(new Error('Did not find self among siblings. Source file: ' + filepath + ' file Slug: ' + file.slug + ' in: ' + problem_list.join(', ')));
                        }
                    }
                }

                const new_filepath = file.url.new_filepath;
                debug('New filepath: %s', new_filepath);
                if (files[new_filepath] && filepath !== new_filepath) {
                    done(new Error('Filepath already used: ' + new_filepath + ' Source file: ' + filepath));
                }
                else if (filepath !== new_filepath) {
                    files[new_filepath] = files[filepath];
                    delete files[filepath];
                }
            }
            else {
                debug('Ignorning: %s', filepath);
            }
        });

        // JSON files for space hierarchies
        Object.keys(hierarchies).forEach(function (space) {
            files[space + '.json'] = {contents: new Buffer(JSON.stringify(hierarchies[space]))};
        });

        return done();
    };
};

module.exports = hierarchy;
