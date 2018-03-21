'use strict';
/* eslint-env es6 */

// Set Debugging up
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.DEBUG) {
  process.env.DEBUG = 'docs-server*,*:info,*:error';
}

// check for no-clean switch
const no_clean = !!process.argv.find(val => val === '--no-clean');

// Spawns a dev server with Metalsmith & Webpack live reloading via Browsersync
const debug_lib = require('debug');
const debug = debug_lib('docs-server');
const error = debug_lib('docs-server:error');
const info = debug_lib('docs-server:info');

info('no-clean', no_clean);

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const browser_sync = require('browser-sync');
const strip_ansi = require('strip-ansi');

const thenify = require('thenify');
const exec = thenify(child_process.exec);
const { execSync } = child_process;

const yaml_config = require('node-yaml-config');
const co = require('co');
const extend = require('lodash.defaultsdeep');

const normalise_git_url = require('../modules/normalise_git_url');
const { pre_builder, builder } = require('../lib/builder_module');

// Core config
const core_config = yaml_config.load(path.join(__dirname, '..', 'config.yml'));

// Working copy
const source_repo_path = process.cwd();
const target_repo_path = path.join(source_repo_path, 'src');
const target_repo_site = path.join(source_repo_path, 'site');
const instance_config_path = path.join(source_repo_path, 'config.yml');

info('target_repo_path', target_repo_path);

const exec_options = { cwd: source_repo_path, encoding: 'utf8' };
const instance_repo_url = normalise_git_url(execSync('git config --get remote.origin.url', exec_options).trim());

// Find repo_id for this repository
const repo_id = (Object.keys(core_config.repositories).filter(repo_id => {
  const repo = core_config.repositories[repo_id];
  const repo_url = normalise_git_url(repo.url);
  return instance_repo_url === repo_url;
}) || [''])[0];

if (!repo_id) {
  error('instance_repo_url', instance_repo_url);
  error('core_config.repositories', core_config.repositories);
  throw new Error('Could not match repository to config');
}

info(`repo_id: ${repo_id}`);

const instance_config = yaml_config.load(instance_config_path);
const dev_browser_path = (instance_config && instance_config.site && instance_config.site.dev_browser_path) || '';
info(`dev_browser_path: ${dev_browser_path}`);

const branch =
  instance_config.branch_alias || execSync('git branch | grep -e "^*" | cut -d" " -f 2', exec_options).trim();

if (!branch) {
  error('instance_config_path', instance_config_path);
  error('instance_config', instance_config);
  throw new Error('Could not get current branch from `config.yml` branch_alias or git branch');
}

// Get 404 info page
const content_404 = fs.readFileSync(path.join(source_repo_path, '404.html'));

// Initialize Browsersync and webpack
const sync = browser_sync.create();

const get_filter = file => {
  const file_relative = path.relative(source_repo_path, file);
  debug(`File relative: ${file_relative}`);
  const first_dir = file_relative.split('/').shift();
  if (first_dir === 'src') {
    return file_relative
      .split('/')
      .slice(1)
      .join('/');
  } else {
    return '';
  }
};

// Run metalsmith and reload browsers
// or send a fullscreen error message to the browser instead
const build_docs = () => {
  info('Building Docs');

  co(function*() {
    // Pre-build
    const pre_build = [pre_builder({ branch, repo_id, source_path: target_repo_path })];
    const metadata = {};
    const pre_build_result = yield pre_build;
    pre_build_result.forEach(data => extend(metadata, data));

    // Build
    yield builder(target_repo_path, metadata, target_repo_site, { branch, repo_id, repo_path: source_repo_path });

    yield exec('npm run copy_assets', { encoding: 'utf8', cwd: source_repo_path });

    info('Docs build successfully finished! Reloading browsers.');
    sync.reload();
  }).catch(err => {
    error('Docs build error');
    error(err);
    return sync.sockets.emit('fullscreen:message', {
      title: 'Docs Build Error:',
      body: strip_ansi(`${err.message}\n\n${err.stack}`),
      timeout: 100000
    });
  });
};

// Run full build to start
if (!no_clean) {
  build_docs();
}

// Run Browsersync for server and watching
// Use webpack dev middleware for Hot Module Replacement
// Apply custom chokidar function to rebuild metalsmith when files changed
sync.init(
  {
    server: path.join(source_repo_path, 'site'),
    startPath: dev_browser_path,
    open: true,
    logFileChanges: true,
    plugins: ['bs-fullscreen-message'],
    files: [
      {
        match: [
          path.join(source_repo_path, 'src', '**', '*'),
          path.join(source_repo_path, 'assets', '**', '*'),
          path.join(source_repo_path, 'config.yml')
        ],
        fn: function(event, file) {
          debug(`File changed: ${file}`);
          process.env.FILTER = get_filter(file);

          build_docs();
        }
      }
    ]
  },
  (err, bs) => {
    if (err) {
      error(err);
    }
    bs.addMiddleware('*', (req, res) => {
      // res.writeHead(302, {
      //     "location": "404.html"
      // });
      // res.end("Redirecting!");
      res.write(content_404);
      res.end();
    });
  }
);
