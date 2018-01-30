// Dependencies
const debug_lib = require('debug');
const debug = debug_lib('metalsmith-layouts');
const Promise = require('bluebird');
const extend = require('extend');
const omit = require('lodash.omit');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const multimatch = require('multimatch');
const is_utf8 = require('is-utf8');
const handlebars = require('handlebars');

// Helpers
const readPartials = require('../read_partials');
const templates = {};

const get_template = template_name =>
  new Promise((resolve, reject) => {
    if (!templates[template_name]) {
      fs
        .readFileAsync(template_name, 'utf8')
        .then(template => {
          templates[template_name] = handlebars.compile(template);
          resolve(templates[template_name]);
        })
        .catch(err => reject(err));
    } else {
      resolve(templates[template_name]);
    }
  });

/**
 * Settings
 *
 * Options supported by metalsmith-layouts
 */
const settings = ['default', 'directory', 'engine', 'partials', 'partialExtension', 'pattern', 'rename'];

/**
 * Metalsmith plugin to run files through any layout in a layout `dir`.
 *
 * @param {Mixed} options            {string or object}
 *   @property {String} default [optional]
 *   @property {String} directory [optional]
 *   @property {String} partials [optional]
 *   @property {String} partialExtension [optional]
 *   @property {String} pattern [optional]
 *   @property {Boolean} rename [optional]
 *
 * @return {Function}
 */
const handlebars_layouts = options => {
  // Init
  options = options || {};

  // Map options to local variables
  const def = options.default;
  const dir = options.directory || 'layouts';
  const partialExtension = options.partialExtension;
  const partials = options.partials || {};
  const pattern = options.pattern;
  const rename = options.rename;

  // Move all unrecognised options to params
  const params = omit(options, settings);

  /**
   * Layouts plugin
   *
   * @param  {Object}   files
   * @param  {Object}   metalsmith
   * @param  {Function} done
   *
   * @return {void}
   */
  return (files, metalsmith, done) => {
    debug('Starting layouts');
    const metadata = metalsmith.metadata();

    const meta = extend({}, metadata);

    const contents_are_utf8 = filename => is_utf8(files[filename].contents);
    const has_layout = filename => files[filename].layout || def;

    /**
     * Process any partials and pass them to consolidate as a partials object
     */
    if (partials) {
      if (typeof partials === 'string') {
        params.partials = readPartials(partials, partialExtension, dir, metalsmith);
      } else {
        params.partials = partials;
      }
    }
    Object.keys(params.partials).forEach(partial =>
      handlebars.registerPartial(partial, fs.readFileSync(metalsmith.path(params.partials[partial]), 'utf8'))
    );
    Object.keys(params.helpers).forEach(helper => handlebars.registerHelper(helper, params.helpers[helper]));

    let matched_files = Object.keys(files);
    if (pattern) {
      matched_files = multimatch(matched_files, pattern);
    }
    matched_files = matched_files.filter(contents_are_utf8).filter(has_layout);
    /**
     * Populates template with data
     *
     * @param  {string}   file
     *
     * @return {void}
     */
    const convert = file =>
      new Promise((resolve, reject) => {
        debug('converting file: %s', file);

        // Rename file if necessary
        if (rename) {
          delete files[file];
          const fileInfo = path.parse(file);
          file = path.join(fileInfo.dir, fileInfo.name + '.html');
          debug('renamed file to: %s', file);
        }

        const data = files[file];

        const clone = extend({}, meta, data);
        // Convert contents to "real" string from buffer
        clone.contents = data.contents.toString();

        const template_name = metalsmith.path(dir, data.layout || def);
        debug(`template_name: ${template_name}`);

        get_template(template_name)
          .then(template => {
            debug(`handlebars compile - Start:  ${file}`);
            data.contents = Buffer.from(template(clone), 'utf8');
            debug(`handlebars compile - Finish: ${file}`);

            files[file] = data;

            resolve();
          })
          .catch(err => reject(err));
      });

    // Render all matched files.
    Promise.map(matched_files, convert, { concurrency: 100 })
      .then(() => done())
      .catch(err => done(err));
  };
};

/**
 * Expose `plugin`.
 */
module.exports = handlebars_layouts;
