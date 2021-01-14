'use strict';
/* eslint-env es6 */

// debugging
const { debug, info } = require('../modules/debugger')('doc-builder');

// npm packages
const extend = require('lodash.defaultsdeep');
const path = require('path');
const yaml_config = require('node-yaml-config');

// metalsmith npm packages
const default_values = require('metalsmith-default-values');
const frontmatter = require('metalsmith-matters');
const in_place = require('metalsmith-in-place');
const layouts = require('../modules/metalsmith/handlebars_layout');
const markdown = require('metalsmith-markdown');
const metalsmith = require('metalsmith');
const metalsmith_if = require('metalsmith-if');
const permalinks = require('metalsmith-permalinks');
const sitemap = require('metalsmith-sitemap');

// metalsmith local packages
const algolia_prep = require('../modules/metalsmith/algolia_prep');
const css_md5 = require('../modules/metalsmith/css_md5');
const doc_assets = require('../modules/metalsmith/doc_assets');
const file_contents_preprocess = require('../modules/metalsmith/file_contents_preprocess');
const filter = require('../modules/metalsmith/filter');
const fix_handlebars = require('../modules/metalsmith/fix_handlebars');
const hierarchy = require('../modules/metalsmith/hierarchy');
const history = require('../modules/metalsmith/history');
const left_menu = require('../modules/metalsmith/left_menu');
const list_from_field = require('../modules/metalsmith/list_from_field');
const pages_from_list = require('../modules/metalsmith/pages_from_list');
const redirects = require('../modules/metalsmith/redirects');
const replace_excerpts = require('../modules/metalsmith/replace_excerpts');
const replace_multiexcerpts = require('../modules/metalsmith/replace_multiexcerpts');
const set_description = require('../modules/metalsmith/set_description');
const set_lastmod = require('../modules/metalsmith/set_lastmod');
const set_section = require('../modules/metalsmith/set_section');
const set_versions = require('../modules/metalsmith/set_versions');
const time = require('../modules/metalsmith/time');
const urls = require('../modules/metalsmith/urls');
const versions = require('../modules/metalsmith/versions');
const toc_headers = require('../modules/metalsmith/toc_headers');
const webpack_assets = require('../modules/metalsmith/webpack_assets');

// local packages
const markdown_renderer = require('../modules/markdown_renderer');

const build = (source_path, metadata, destination_path, repo_details) => {
  info('Starting build: %s', source_path);

  info('Node Environment: %s', process.env.NODE_ENV);

  const content_filter =
    process.env.NODE_ENV === 'development' && process.env.FILTER
      ? process.env.FILTER.split(',')
      : void 0;

  const clean = !content_filter;
  debug(`content_filter: ${content_filter}`);
  debug(`clean: ${clean}`);

  const { repo_id, repo_path, branch } = repo_details;
  debug('repo_id', repo_id);
  debug('repo_path', repo_path);
  debug('branch', branch);
  const module_config_path = path.join(__dirname, '..', 'config.yml');
  debug('module_config_path', module_config_path);
  const module_config = yaml_config.load(module_config_path);
  debug('module_config', module_config);

  const { ALGOLIA_KEY: algolia_key = '' } = process.env;
  const algolia_config = {
    projectId: module_config.site.algolia_id,
    index: module_config.site.algolia_index,
    clearIndex: false,
  };
  if (algolia_key) {
    algolia_config.privateKey = algolia_key;
  }

  module_config.markdown_options.renderer = markdown_renderer;

  const handlebars_helpers = {
    condition: require('../modules/handlebars/condition'),
    file: require('../modules/handlebars/file_path'),
    file_content: require('../modules/handlebars/file_content'),
    head_title: require('../modules/handlebars/head_title'),
    inline_svg: require('../modules/handlebars/inline_svg'),
    md: require('../modules/handlebars/markdown')(
      module_config.markdown_options
    ),
    moment: require('../modules/handlebars/moment'),
    obj_key: require('../modules/handlebars/object_key'),
    page: require('../modules/handlebars/page_path'),
    page_title: require('../modules/handlebars/page_title'),
    since: require('../modules/handlebars/since'),
    sluggy: require('../modules/handlebars/sluggy'),
    sort_object: require('../modules/handlebars/sort_object'),
    table_from_details: require('../modules/handlebars/table_from_details'),
  };

  const instance_config_path = path.join(source_path, '..', 'config.yml');
  debug('instance_config_path', instance_config_path);
  const instance_config = yaml_config.load(instance_config_path);
  debug('instance_config', instance_config);

  let version_path = '';
  if (
    instance_config.site &&
    instance_config.site.versions &&
    instance_config.site.versions.length
  ) {
    let current_version = instance_config.site.versions.filter(
      (version) => version.is_current_version
    );
    if (current_version && current_version[0]) {
      version_path = current_version[0].url_path;
    }
  }

  const sitemap_filename =
    branch === 'static'
      ? `sitemap-${branch}.xml`
      : `sitemap-${repo_id}${version_path ? '-' + version_path : ''}.xml`;

  const config = extend({}, module_config, instance_config);
  debug('config', config);

  const noindex = repo_id
    ? config.repositories[repo_id].branches[branch].noindex || false
    : false;

  // Add site config to the metadata
  const metad = extend({}, metadata, {
    site: config.site,
  });

  const space_labels = [];
  const space_label_pages = [];
  if (
    config &&
    config.site &&
    config.site.spaces &&
    config.site.spaces.length
  ) {
    config.site.spaces.forEach(function (space) {
      const version_space_path = version_path
        ? space.space_path + '/' + version_path
        : space.space_path;
      const version_space_key = version_space_path.split('/').join('_');
      space_labels.push({
        pattern: version_space_path + '/*.md',
        field: 'labels',
        key_name: version_space_key + '_labels',
        fields_to_store: {
          title: 'title',
          slug: 'slug',
          path: 'url.key.space_path',
          url: 'url.full',
        },
        sort_field: 'title',
      });

      space_label_pages.push({
        path: version_space_path + '/label',
        list_key: version_space_key + '_labels',
        list_index_defaults: {
          title: 'Labels',
          layout: 'labels.hbs',
          url: {
            key: {
              version: version_path,
              space: space.space_path,
              space_path: version_space_path,
              slug: 'label',
              parts: [],
              full: '',
            },
          },
        },
        defaults: {
          layout: 'label.hbs',
          no_side_menu: true,
          hierarchy: {
            parents: [
              { name: space.space_name, url: '/' + version_space_path + '/' },
              { name: 'Labels', url: '/' + version_space_path + '/label/' },
            ],
          },
          url: {
            key: {
              version: version_path,
              space: space.space_path,
              space_path: version_space_path,
              slug: 'label',
              parts: [],
              full: '',
            },
          },
        },
      });
    });
  }

  const handlebars_options = {
    engine: 'handlebars',
    partials: 'layouts/partials',
    helpers: handlebars_helpers,
  };

  const metalsmith_working_path = path.join(__dirname, '..');
  const relative_destination_path = path.relative(
    metalsmith_working_path,
    destination_path
  );

  return (
    metalsmith(metalsmith_working_path)
      // return new Promise(function (resolve, reject) {
      //     return metalsmith(metalsmith_working_path)
      .source(source_path)
      .clean(clean)
      // Ignore files
      .ignore(config.site.remove_files_pattern)
      // Check frontmatter is not malformed
      .frontmatter(false)
      .use(
        frontmatter({
          strict: true,
        })
      )
      // Filters and Limits to speed up writing
      .use(
        metalsmith_if(
          content_filter,
          filter({
            pattern: content_filter,
          })
        )
      )
      // Add metadata
      .metadata(metad)
      .use(
        set_versions({
          branch,
          repo_id,
          repositories: config.repositories,
        })
      )
      .use(time('set_versions'))
      .use(file_contents_preprocess())
      .use(time('file_contents_preprocess'))
      // .use(logging.file_details)
      // .use(logging.metadata)
      .use(
        webpack_assets({
          stats_file: 'lib/webpack.stats.json',
        })
      )
      .use(time('webpack_assets'))
      .use(
        css_md5({
          stats_file: 'lib/css.md5',
        })
      )
      .use(time('css_md5'))
      .use(
        history({
          pattern: '**/*.{md,html}',
          reverse: true,
          repo_id,
          repo_path,
          branch,
        })
      )
      .use(time('history'))
      .use(urls(config.site))
      .use(time('urls'))
      .use(hierarchy(config.site))
      .use(time('hierarchy'))
      .use(set_section({}))
      .use(time('set_section'))
      .use(redirects())
      .use(time('redirects'))
      .use(versions())
      .use(time('versions'))
      .use(default_values(config.page_defaults))
      .use(time('default_values'))
      .use(list_from_field(space_labels))
      .use(time('list_from_field'))
      .use(pages_from_list(space_label_pages))
      .use(time('pages_from_list'))
      .use(replace_multiexcerpts())
      .use(time('replace_multiexcerpts'))
      .use(replace_excerpts())
      .use(time('replace_excerpts'))
      .use(set_description({}))
      .use(time('set_description'))
      .use(markdown(config.markdown_options))
      .use(time('markdown'))
      .use(fix_handlebars())
      .use(time('fix_handlebars'))
      .use(toc_headers())
      .use(time('toc_headers'))
      .use(left_menu())
      .use(time('left_menu'))
      .use(
        in_place(
          extend({}, handlebars_options, {
            pattern: '**/*',
          })
        )
      )
      .use(time('in_place'))
      // .use(markdown(config.markdown_options))
      // .use(time('markdown'))
      // // .use(fix_handlebars())
      // // .use(time('fix_handlebars'))
      // .use(toc_headers())
      // .use(time('toc_headers'))
      // .use(left_menu())
      // .use(time('left_menu'))
      .use(
        metalsmith_if(
          algolia_key,
          algolia_prep({
            pattern: '**/*.html',
          })
        )
      )
      .use(metalsmith_if(algolia_key, time('algolia')))
      .use(
        layouts(
          extend({}, handlebars_options, {
            directory: 'layouts',
          })
        )
      )
      .use(time('layouts'))
      .use(doc_assets())
      .use(time('doc_assets'))
      .use(
        permalinks({
          relative: false,
        })
      )
      .use(time('permalinks'))
      .use(set_lastmod)
      .use(
        metalsmith_if(
          !noindex,
          sitemap({
            hostname: config.site.url,
            omitIndex: true,
            output: sitemap_filename,
          })
        )
      )
      .use(metalsmith_if(!noindex, time('sitemap')))
      .destination(relative_destination_path)
      .build()
  );
};

module.exports = build;
