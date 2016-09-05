'use strict';
/* eslint-env es6 */


const path = require('path');
const yaml_config = require('node-yaml-config');

module.exports = function (config, path_only = true) {
    if (typeof config === 'string') {
        config = yaml_config.load(path.join(config, 'config.yml'));
    }

    // Default return value
    let version = (path_only) ? '' : void 0;

    if (config.site && config.site.versions && config.site.versions.length) {
        let current_version = config.site.versions.filter(this_version => this_version.is_current_version);

        if (current_version && current_version[0]) {
            if (path_only) {
                version = current_version[0].url_path;
            }
            else {
                version = current_version[0];
            }
        }
    }

    return version;
};
