'use strict';
/* eslint-env es6 */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-lts-review-flag');
const error = debug_lib('metalsmith-lts-review-flag:error');

const moment = require('moment');


const lts_review = function () {
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();

        if (metadata.site.review_period) {
            let review_period_split = metadata.site.review_period.split(' ');
            if (review_period_split.length === 2) {
                let review_period = moment.duration(+review_period_split[0], review_period_split[1]);

                if (review_period.asMilliseconds()) {
                    Object.keys(files).forEach(function (filepath) {
                        debug('Filepath: %s', filepath);
                        let file = files[filepath];
                        let needs_review = true;

                        if (file.history && file.history[0] && file.history[0].date) {
                            let most_recent_commit = moment('file.history[0].date', 'YYYY-MM-DD HH:mm');
                            if (most_recent_commit.isValid()) {

                                // Expired if (latest commit + review period) is after today
                                needs_review = moment().isAfter(most_recent_commit.add(review_period));
                            }
                            else {
                                error('Most recent commit date could not be parsed: %s, file: %s', file.history[0].date, filepath);
                            }
                        }
                        else {
                            error('History could not be found: %s', filepath);
                        }
                        file.needs_review = needs_review;
                    });
                }
                else {
                    error('Review period did not result in a valid duration. %s', metadata.site.review_period);
                    return done(new Error('Review period did not result in a valid duration'));
                }
            }
            else {
                error('Review period in incorrect form. %s', metadata.site.review_period);
                return done(new Error('Review period in incorrect form'));
            }
        }

        return done();
    };
};

// No initialisation required
module.exports = lts_review();
