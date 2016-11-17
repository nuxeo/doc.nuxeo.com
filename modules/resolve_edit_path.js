'use strict';
/* eslint-env es6 */

// Debugging
const debug_lib = require('debug');
// const debug = debug_lib('resolve-edit-path');
const error = debug_lib('resolve-edit-path:error');

const github_match = /^(https:\/\/github\.com\/|git@github.com:)(.+)\.git$/;

const resolve_repository = function (push_url) {
    if (!push_url) {
        return void 0;
    }
    let file_url_prefix;

    const is_github = github_match.exec(push_url);
    if (is_github && is_github[2]) {
        file_url_prefix = `https://github.com/${is_github[2]}/`;
    }
    else {
        error('Incorrect push_url or repository matcher: %s', push_url);
    }

    const url = () => file_url_prefix;

    const file = (branch = 'master', path = '') => file_url_prefix && `${file_url_prefix}tree/${branch}/${path}`;

    return {
        url,
        file
    };
};

module.exports = resolve_repository;
