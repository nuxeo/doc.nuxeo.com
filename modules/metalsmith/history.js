'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-history');
const error = debug_lib('metalsmith-history:error');
const Joi = require('joi');
const path = require('path');
const multimatch = require('multimatch');
const moment = require('moment');
const thenify = require('thenify');
const exec = thenify(require('child_process').exec);
const sort_by = require('lodash.sortby');
// https://github.com/nuxeo/doc.nuxeo.com-platform-spaces/blob/master/src/admindoc/bulk-document-importer.md
const get_history = function (source_path, filepath, file, options) {
    file.history = file.history || [];

    return exec(`git log --pretty=format:'%cn%x09%cd%x09%s' src/${filepath}`, {encoding: 'utf8', cwd: options.repo_path})
    .then((data) => {
        debug(`data: src/${filepath}`, data);
        if (data && data[0] && typeof data[0] === 'string') {
            data[0].split('\n')
            .forEach(function (history_item_raw) {
                const history_item_split = history_item_raw.split('\t');
                const history_item = {
                    author : history_item_split[0],
                    date   : moment.utc(history_item_split[1], 'ddd MMM DD HH:mm:ss YYYY Z').format('YYYY-MM-DD HH:mm'),
                    message: history_item_split[2]
                };
                file.history.push(history_item);
                debug('history_item: ', history_item);
            });

            // Sort
            if (typeof options.sort_by === 'function') {
                debug('Using Sort Function');
                file.history.sort(options.sort_by);
            }
            else {
                debug('NOT Using Sort Function');
                file.history = sort_by(file.history, 'date');
            }

            if (options.reverse) {
                debug('Reverse');
                file.history.reverse();
            }
        }
        else {
            error('No git history for: %s, %s, %s', options.repo_path, options.branch, filepath);
        }
    });

    // debug('git_history: %o', git_history);
};

const schema = Joi.object().keys({
    pattern: [Joi.array().min(1).required(), Joi.string().required()],
    sort_by: Joi.func().optional(),
    reverse: Joi.bool().optional().default(false),
    repo_id: Joi.string(),
    branch : Joi.string()
});

const list_from_field = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        const files_source = metalsmith.source();
        // Check options fits schema
        const validation = schema.validate(options);
        if (validation.error) {
            error('Validation failed, %o', validation.error.details[0].message);
            return done(validation.error);
        }
        options = validation.value;

        // Convert to array if it's a string
        options.pattern = (typeof options.pattern === 'string') ? [options.pattern] : options.pattern;

        const repo_path = options.repo_path = path.join(__dirname, '../../repositories', options.repo_id);

        debug('Repository: %s, Branch: %s', repo_path, options.branch);

        return exec(`git checkout -f origin/${options.branch}`, {encoding: 'utf8', cwd: repo_path})
        .then(() => {
            const matched_files = multimatch(Object.keys(files), options.pattern).map((filepath) => {
                debug('Filepath: %s', filepath);
                const file = files[filepath];

                return get_history(files_source, filepath, file, options);
            });

            return Promise.all(matched_files)
            .then(() => done())
            .catch(err => done(err));
        })
        .catch(err => done(err));
    };
};

module.exports = list_from_field;
