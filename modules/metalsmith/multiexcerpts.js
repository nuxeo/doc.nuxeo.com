// Debugging
const { debug, warn, error } = require('../debugger')(
  'metalsmith-multiexcerpts'
);

// npm packages
const Joi = require('joi');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;

// local packages
const add_link_context = require('../add_link_context');
const open_close_positions = require('../open_close_positions');

const schema = Joi.object()
  .keys({
    placeholder: Joi.string().optional().default('multiexcerpt'),
  })
  .default({ placeholder: 'multiexcerpt' });

/**
 * A Metalsmith plugin to extract a multiexcerpt from files.
 *
 * @param {Object} options
 * @return {Function}
 **/

const multiexcerpts = (options) => (files, metalsmith, done) => {
  debug('Options: %o', options);
  // Check options fits schema
  const validation = schema.validate(options, { allowUnknown: true });
  if (validation.error) {
    return done(validation.error);
  }
  options = validation.value;

  debug('repo_id', options.repo_id);
  debug('branch', options.branch);

  const metadata = metalsmith.metadata();
  const re_definition = new RegExp(
    '{{! ' + options.placeholder + '( +name=["\'](.+?)["\'])}}',
    'gm'
  );
  const closing_placeholder = '{{! /multiexcerpt}}';

  const loop_completed = Object.keys(files).every(function (filepath) {
    let successful = true;
    const file = files[filepath];

    if (!file.url || !file.url.key) {
      error('File does not have a url: %s', filepath);
      error('file: %o', file);
      done(new Error('File does not have a url: ' + filepath));
      successful = false;
      return successful;
    }
    const contents = file.contents.toString();
    const key = file.url.key.full;

    debug('filepath: %s, key: %s', filepath, key);

    let placeholder_positions = [];
    let match;

    // Get opening placeholder positions
    while ((match = re_definition.exec(contents)) !== null) {
      // page as key: space:page-name else space:page-name:name-of-excerpt
      debug(
        '%s: page: %s, name: %s',
        options.placeholder,
        file.title,
        match[2]
      );

      placeholder_positions.push({
        key: key,
        type: 'open',
        name: match[2],
        position: re_definition.lastIndex,
        raw: {
          text: match[0],
          match_start: match.index,
          match_end: re_definition.lastIndex,
        },
      });
    }

    // Get closing placeholder positions
    let closing_position = contents.indexOf(closing_placeholder);
    while (closing_position !== -1) {
      const last_index = closing_position + closing_placeholder.length;
      placeholder_positions.push({
        type: 'close',
        position: closing_position,
        raw: {
          match_start: closing_position,
          match_end: last_index,
        },
      });
      closing_position = contents.indexOf(closing_placeholder, last_index);
    }

    // Get the open and closed positions of the nested placeholders
    try {
      placeholder_positions = open_close_positions(
        placeholder_positions,
        'name',
        'position'
      );
    } catch (err) {
      error('%s: page: %s, %s', options.placeholder, file.title, err);
      return done(new Error('Page: ' + file.title + '\n\n' + err));
    }
    debug('placeholder_positions: %o', placeholder_positions);

    // Set the multiexcerpts
    if (placeholder_positions.length) {
      metadata[options.placeholder] = metadata[options.placeholder] || {};
      placeholder_positions.forEach(function (placeholder) {
        const placeholder_key = key + '/' + slug(placeholder.key);
        debug('placeholder key: %s', placeholder.key);
        if (metadata[options.placeholder][placeholder_key]) {
          warn(
            'Duplicate placeholder: %s - %s',
            options.placeholder,
            placeholder_key
          );
        } else {
          let multiexcerpt = contents.substring(
            placeholder.start,
            placeholder.end
          );
          multiexcerpt = add_link_context(multiexcerpt, file.url.key);
          metadata[options.placeholder][placeholder_key] = multiexcerpt;
          debug('%s - Set: %s', options.placeholder, placeholder_key);
          // debug('content: %s', metadata[options.placeholder][placeholder.key].content);
        }
      });
    }
    return successful;
  });

  return loop_completed ? done() : void 0;
};

module.exports = multiexcerpts;
