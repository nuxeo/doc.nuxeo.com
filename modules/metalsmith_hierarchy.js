'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-hierarchy');
var error = debug_lib('metalsmith-hierarchy:error');
var Joi = require('joi');
var path = require('path');
var multimatch = require('multimatch');
var TreeModel = require('tree-model');
var tree = new TreeModel();
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;
var trees = {};

var schema = Joi.array().min(1).items(Joi.object().keys({
    space_path: Joi.string().required(),
    space_name: Joi.string().required(),
    versions  : Joi.array().optional().items(Joi.object().keys({
        label     : Joi.string().required(),
        is_current: Joi.bool().optional().default(false),
        url_path  : Joi.string().optional().default('')
    })),
    flatten     : Joi.bool().optional().default(true),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['*.md', '*.html'])
}));

var hierarchy = function (options) {
    /* eslint guard-for-in:0 */
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        /* eslint consistent-return: 0 */

        // Check options fits schema
        var schema_err;
        schema.validate(options, function (err, value) {
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                schema_err = err;
            }
            options = value;
        });
        if (schema_err) {
            return done(schema_err);
        }
        if (!Array.isArray(options)) {
            return done();
        }

        var metadata = metalsmith.metadata();
        var hierarchies = {};
        options.forEach(function (option) {
            hierarchies[option.space_path] = hierarchies[option.space_path] || {
                id  : option.space_path,
                path: 'nxdoc',
                slug: '',
                name: option.space_name
            };
        });

        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            var file = files[filepath];
            file.slug = file.slug || (file.title ? slug(file.title) : void 0) || slug(path.basename(filepath, path.extname(filepath)));
            options.forEach(function (option) {
                /* eslint no-cond-assign: 0, no-loop-func: 0 */
                if (multimatch(filepath, [option.space_path + '/**/*']).length) {
                    var filepath_split = filepath.split('/');
                    filepath_split.shift(); // Removes the space_path from array
                    var item;
                    var id;
                    var missing_node;

                    file.hierarchy = file.hierarchy || {};
                    file.hierarchy.space_path = option.space_path;

                    if (option.versions) {
                        file.hierarchy.versions = option.versions;

                        // Get current version information
                        for (var i = 0; i < option.versions.length; i++) {
                            if (option.versions[i].is_current) {
                                file.hierarchy.version_label = option.versions[i].label;
                                file.hierarchy.version_path = option.versions[i].url_path;
                            }
                        }

                    }

                    file.hierarchy.path = option.space_path + '/' + (file.hierarchy.version_path ? file.hierarchy.version_path + '/' : '');
                    var current_item = hierarchies[option.space_path];
                    debug('Space: %s, path: %o', option.space_path, filepath_split, current_item);

                    while (item = filepath_split.shift()) {
                        if (multimatch(item, option.file_pattern).length) {
                            try {
                                // filename without extension
                                id = /([\w \.-]+?)(\.[\w-]+)?$/.exec(item)[1];
                            }
                            catch (e) {
                                done(new Error('Issue with file: ' + filepath + ' Error: ' + e));
                            }

                            // Don't include hidden pages
                            if (!file.hidden) {
                                current_item.children = current_item.children || [];
                                current_item.children.push({
                                    id        : id,
                                    name      : file.title,
                                    slug      : file.slug,
                                    path      : option.space_path + '/' + (file.hierarchy.version_path ? file.hierarchy.version_path + '/' : ''),
                                    space_path: option.space_path
                                });
                            }
                        }
                        else {
                            missing_node = true;
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
                        }

                    }
                }
            });
        });


        // Add hierarchy metadata and flatten
        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            options.forEach(function (option) {
                /* eslint no-cond-assign: 0, no-loop-func: 0 */
                if (multimatch(filepath, [option.space_path + '/**/*']).length && multimatch(filepath.split('/').pop(), option.file_pattern).length) {
                    // error('File: %s, Space: %s, Version: %s', filepath, file.hierarchy.space_path, file.hierarchy.version);
                    // Don't include hidden pages
                    if (!file.hidden) {
                        var root = trees[file.hierarchy.space_path] = trees[file.hierarchy.space_path] || tree.parse(hierarchies[file.hierarchy.space_path]);

                        var node = root.first(function (item) {
                            return item.model.slug === file.slug;
                        });
                        if (!node) {
                            done(new Error('Missing hierarchy item for file: ' + filepath));
                        }
                        var node_path = node.getPath();
                        // error('Node Path: %o', node_path);

                        // Add breadcrumbs
                        file.hierarchy.parents = [];
                        for (var i = 0; i < node_path.length - 1; i++) {
                            file.hierarchy.parents.push({
                                url : '/' + file.hierarchy.path + (node_path[i].model.slug ? node_path[i].model.slug + '/' : ''),
                                name: node_path[i].model.name
                            });
                            // error('Node Element: %o', node_path[i].model.id);
                        }

                        // Add children
                        node = node_path.pop();
                        file.hierarchy.children = [];
                        for (i = 0; i < node.children.length; i++) {
                            file.hierarchy.children.push({
                                url : '/' + file.hierarchy.path + (node.children[i].model.slug ? node.children[i].model.slug + '/' : ''),
                                name: node.children[i].model.name
                            });
                        }
                        // Add siblings
                        node = node_path.pop();
                        file.hierarchy.siblings = [];
                        var found_myself = false;
                        // error('File slug: %s', file.slug);
                        for (i = 0; i < node.children.length; i++) {
                            if (node.children[i].model.slug !== file.slug) {
                                file.hierarchy.siblings.push({
                                    url : '/' + file.hierarchy.path + (node.children[i].model.slug ? node.children[i].model.slug + '/' : ''),
                                    name: node.children[i].model.name
                                });
                            }
                            else {
                                found_myself = true;
                            }
                        }
                        if (!found_myself) {
                            var problem_list = [];
                            for (i = 0; i < file.hierarchy.siblings.length; i++) {
                                problem_list.push(file.hierarchy.siblings[i].slug);
                            }
                            done(new Error('Did not find self among siblings. Source file: ' + filepath + ' file Slug: ' + file.slug + ' in: ' + problem_list.join(', ')));
                        }
                        // node_path.(function (element) {
                        // node_path.each(function (index, element) {
                            // element);
                        // });
                    }

                    var new_filepath = file.hierarchy.path + file.slug + '.' + filepath.split('.').pop();
                    debug('New filepath: %s', new_filepath);
                    if (files[new_filepath] && filepath !== new_filepath) {
                        done(new Error('Filepath already used: ' + new_filepath + ' Source file: ' + filepath));
                    }
                    else if (filepath !== new_filepath) {
                        files[new_filepath] = files[filepath];
                        delete files[filepath];
                    }
                }
            });
        });
        metadata.hierarchies = hierarchies;

        // JSON files for space hierarchies
        Object.keys(hierarchies).forEach(function (space) {
            files[space + '.json'] = {contents: new Buffer(JSON.stringify(hierarchies[space]))};
        });

        // TODO: test clashing!

        /*
        hierarchy:
            space: NXDOC
            space_name: Nuxeo Platform Developer Documentation
            version: FT
            versions:
                - LTS 2015
                - 6.0
                - 5.8
            parents:
                tutorials: Tutorials
            siblings:
                how-to-index: How To Index
                nuxeo-blog-tutorials: Nuxeo Blog Tutorials
                quick-overview: Quick Overview
                quick-start-series: Quick Start Series
                transversal-how-tos: Transversal How Tos
            children:
                design-tips: DESIGN-TIPS
                how-to-customize-email-templates: HOW-TO-CUSTOMIZE-EMAIL-TEMPLATES
                how-to-publish-a-news-feature-in-workspaces: HOW-TO-PUBLISH-A-NEWS-FEATURE-IN-WORKSPACES
                learning-rest-api: LEARNING-REST-API
                platform-as-a-service: PLATFORM-AS-A-SERVICE
                understand-expression-and-scripting-languages-used-in-nuxeo: UNDERSTAND-EXPRESSION-AND-SCRIPTING-LANGUAGES-USED-IN-NUXEO
                workflow-use-cases: WORKFLOW-USE-CASES
        */

        done();
    };
};

module.exports = hierarchy;
