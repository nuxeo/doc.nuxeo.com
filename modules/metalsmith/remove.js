'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-remove');
var error = debug_lib('metalsmith-remove:error');
var multimatch   = require('multimatch');

var remove = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        if (options && options.pattern) {
            Object.keys(files).forEach(function (file) {
                if (multimatch(file, options.pattern).length) {
                    debug('Removing %s from being processed', file);
                    delete files[file];
                }
            });
        }
        else {
            error('No pattern passed, options is: %o', options);
        }

        done();
    };
};

module.exports = remove;
