'use strict';
/* eslint-env es6 */


const path = require('path');
const yaml_config = require('node-yaml-config');

const exec = require('child_process').execSync;


module.exports = function (config, path_only = true) {
    if (typeof config === 'string') {
        config = yaml_config.load(path.join(__dirname, '..', 'config.yml'));
    }

    // Default return value
    let version = (path_only) ? '' : void 0;

    if (config.site && config.site.versions && config.site.versions) {
        exec("git branch | grep ^\\* | grep -oE '[a-zA-Z0-9_-]+$'", {encoding: 'utf8', cwd: __dirname}, function (branch_data) {
            let branch_name;
            if (branch_data && branch_data[0] && typeof branch_data[0] === 'string') {
                branch_name = branch_data[0].trim();
            }

            const current_version = config.site.versions[branch_name];

            if (current_version) {
                if (path_only) {
                    version = current_version.url_path;
                }
                else {
                    version = current_version;
                }
            }
        });
    }

    return version;
};
