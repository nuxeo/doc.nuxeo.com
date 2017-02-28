'use strict';
/* eslint-env es6 */

// Debugging
const {debug, error} = require('../debugger')('metalsmith-set-versions');

// npm packages
const Joi = require('joi');

// Options schema
const schema = Joi.object().keys({
    repo_id     : Joi.string().required(),
    branch      : Joi.string().required(),
    repositories: Joi.object().required()
});

const sort_by_field = (field) => {
    return (one, two) => {
        const a = one && one[field];
        const b = two && two[field];

        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
};

/**
 * A Metalsmith plugin to set the description from excerpt.
 *
 * @param {Object} options
 * @return {Function}
**/
const set_versions = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        // Check options fits schema
        const validation = schema.validate(options);
        if (validation.error) {
            error('Validation failed, %o', validation.error.details[0].message);
            return done(validation.error);
        }
        options = validation.value;
        const {branch: current_branch_name, repo_id: current_repository_name, repositories} = options;

        const metadata = metalsmith.metadata();

        // Overwrite site.versions
        metadata.site.versions = [];

        Object.keys(repositories).forEach((repository_name) => {
            const repository = repositories[repository_name];
            debug('repos', repository);
            Object.keys(repository.branches).forEach((branch_name) => {
                if (metadata.site.versions) {
                    const branch = repository.branches[branch_name];
                    branch.is_current_version = repository_name === current_repository_name && branch_name === current_branch_name;

                    if (branch.is_current_version) {
                        metadata.current_branch = branch;
                    }

                    if (!branch.no_versioning) {
                        metadata.site.versions.push(branch);

                    }
                    // Current branch doesn't have versioning
                    else if (branch.no_versioning && branch.is_current_version) {
                        delete metadata.site.versions;
                    }
                }
            });
        });
        metadata.site.versions = metadata.site.versions && metadata.site.versions.sort(sort_by_field('order'));
        debug('versions', metadata.site.versions);

        return done();
    };
};

module.exports = set_versions;
