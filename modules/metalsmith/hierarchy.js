'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-hierarchy');
var error = debug_lib('metalsmith-hierarchy:error');
var Joi = require('joi');
// var path = require('path');
var multimatch = require('multimatch');
var TreeModel = require('tree-model');
var tree = new TreeModel();
var slug = require('slug');
slug.defaults.modes.pretty.lower = true;
var trees = {};

var schema = Joi.object().keys({
    versions: Joi.array().optional().items(Joi.object().keys({
        label             : Joi.string().required(),
        is_current_version: Joi.bool().optional().default(false),
        url_path          : Joi.string().optional().default('')
    })),
    flatten     : Joi.bool().optional().default(true),
    file_pattern: Joi.array().items(Joi.string()).optional().default(['**/*.md', '**/*.html'])
});

var hierarchy = function (options) {
    /* eslint guard-for-in:0 */
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        // Check options fits schema
        var schema_err;
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

        var metadata = metalsmith.metadata();

        var hierarchies = metadata.hierarchies;

        // Add hierarchy to files and flatten
        Object.keys(files).forEach(function (filepath) {
            var file = files[filepath];
            var space_path = file.url.key.space_path;
            file.hierarchy = file.hierarchy || {};

            if (multimatch(filepath, options.file_pattern).length && space_path) {
                // Don't include hidden pages
                if (!file.hidden) {
                    var root = trees[space_path] = trees[space_path] || tree.parse(hierarchies[space_path]);

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
                            url : node_path[i].model.url.full,
                            name: node_path[i].model.name
                        });
                        // error('Node Element: %o', node_path[i].model.id);
                    }

                    // Add children
                    node = node_path.pop();
                    file.hierarchy.children = [];
                    for (i = 0; i < node.children.length; i++) {
                        file.hierarchy.children.push({
                            url : node.children[i].model.url.full,
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
                                url : node.children[i].model.url.full,
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
                }

                var new_filepath = file.url.new_filepath;
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
