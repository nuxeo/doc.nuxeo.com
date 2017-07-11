'use strict';
/* eslint-env es6 */

// Debugging
const {debug, warn, error} = require('../debugger')('metalsmith-get-assets');

// npm packages
const Joi = require('joi');
const path = require('path');
const readdirs = require('recursive-readdir');

// options schema
const schema = Joi.object().keys({
    assets_path: Joi.string().required()
});

const get_assets = function (options) {
    debug(`Options: ${options}`);
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();
        metadata.assets = metadata.assets || {};

        // Check options fits schema
        const validation = schema.validate(options);
        if (validation.error) {
            error('Validation failed, %o', validation.error.details[0].message);
            return done(validation.error);
        }
        options = validation.value;


        let version_path = '';
        if (metadata.site.versions) {
            const current_version = metadata.site.versions.filter(version => version.is_current_version);
            if (current_version && current_version[0] && current_version.url_path) {
                version_path = current_version[0].url_path;
            }
        }

        debug(`assets_path: ${options.assets_path}`);
        debug(`version_path: ${version_path}`);

        // Get assets list
        readdirs(options.assets_path, function (err, asset_filenames) {
            if (err) {
                error('Problem reading assets directory');
                return done(err);
            }

            // Files is an array of filename
            asset_filenames.forEach(asset_filename => {
                // Strip the path and add the path prefix
                asset_filename = path.relative(options.assets_path, asset_filename);

                const asset_info = path.parse(asset_filename);
                const asset_path = asset_info.dir.split(path.sep);
                const space = asset_path.shift();
                const page = asset_path.join(path.sep);

                if (metadata.assets[asset_filename]) {
                    warn(`Duplicate key found: "${asset_filename}"`);
                }
                else {
                    let filename = path.join(version_path, asset_filename);
                    metadata.assets[filename] = {
                        url    : path.sep + filename,
                        id     : asset_info.base,
                        version: version_path,
                        space,
                        page
                    };
                }
            });

            return done();
        });
        return void 0;
    };
};

module.exports = get_assets;
