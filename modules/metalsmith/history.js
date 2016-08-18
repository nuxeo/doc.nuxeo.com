'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-history');
var info = debug_lib('metalsmith-history:info');
var error = debug_lib('metalsmith-history:error');
var Joi = require('joi');
// var path = require('path');
var multimatch = require('multimatch');
var moment = require('moment');
var execSync = require('child_process').execSync;
var sort_by = require('lodash.sortby');

var schema = Joi.object().keys({
    pattern: [Joi.array().min(1).required(), Joi.string().required()],
    sort_by: Joi.func().optional(),
    reverse: Joi.bool().optional().default(false)
});

var get_history = function (source_path, filepath, file, options) {
    var git_history;
    file.history = file.history || [];

    // Synchonous method otherwise the template doesn't have the information in time.
    git_history = execSync('cd ' + source_path + " && git log --pretty=format:'%cn%x09%cd%x09%s' " + filepath, {encoding: 'utf8'}).split('\n');

    // debug('git_history: %o', git_history);
    git_history.forEach(function (history_item_raw) {
        var history_item_split = history_item_raw.split('\t');
        var history_item = {
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
        file.history.reverse();
        debug('Reverse');
    }
};

var list_from_field = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        info('Processing');
        var files_source = metalsmith.source();
        // Check options fits schema
        schema.validate(options, function (err, value) {
            /* eslint consistent-return: 0 */
            if (err) {
                error('Validation failed, %o', err.details[0].message);
                return done(err);
            }
            // Convert to array if it's a string
            value.pattern = (typeof value.pattern === 'string') ? [value.pattern] : value.pattern;
            options = value;
        });
        // error('Options: %o', options);


        Object.keys(files).forEach(function (filepath) {
            debug('Filepath: %s', filepath);
            var file = files[filepath];

            if (multimatch(filepath, options.pattern).length) {
                get_history(files_source, filepath, file, options);
            }
        });

        done();
    };
};

module.exports = list_from_field;
