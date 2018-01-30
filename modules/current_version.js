'use strict';
/* eslint-env es6 */

const path = require('path');
const yaml_config = require('node-yaml-config');
const exec = require('child_process').execSync;

module.exports = function(config, path_only = true) {
  let cwd = __dirname;
  if (typeof config === 'string') {
    // Set the cwd to get the correct repo and branch
    cwd = config;
    // Always use the central repo config
    config = yaml_config.load(path.join(__dirname, '..', 'config.yml'));
  }

  // Default return value
  let version = path_only ? '' : void 0;

  if (config.repositories) {
    // Get the repo_url
    const repo_url = exec('git config --get remote.origin.url', {
      encoding: 'utf8',
      cwd: cwd
    });
    // Only use the last part of the url to allow for protocol differences
    const repo_url_part =
      (typeof repo_url === 'string' &&
        repo_url
          .split('/')
          .pop()
          .trim()) ||
      '';
    // console.log('repo_url_part', repo_url_part);

    // Get the branch name
    const branch_name = exec("git branch | grep ^\\* | grep -oE '[a-zA-Z0-9_-]+$'", {
      encoding: 'utf8',
      cwd: cwd
    }).trim();

    // console.log('branch_name', branch_name);

    // find the current version from the repositories object.
    const current_version = Object.keys(config.repositories)
      .filter(repo_id => config.repositories[repo_id].url.includes(repo_url_part))
      .map(repo_id => {
        const repo = config.repositories[repo_id];
        return Object.keys(repo.branches)
          .filter(branch_id => branch_id === branch_name)
          .map(branch_id => {
            return repo.branches[branch_id];
          })
          .pop();
      })
      .pop();

    // console.log('current_version', current_version);

    if (current_version) {
      if (path_only) {
        version = current_version.url_path;
      } else {
        version = current_version;
      }
    }
  }
  // console.log('version', version);

  return version;
};
