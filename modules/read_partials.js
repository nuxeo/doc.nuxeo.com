/* eslint-env es6 */

// Dependencies
const path = require('path');
const read = require('fs-readdir-recursive');

/**
 * Helper for reading a folder with partials, returns a `partials` object that
 * can be consumed by consolidate.
 *
 * @param {String} partialsPath
 * @param {String} partialExtension
 * @param {String} layoutsPath
 * @param {Object} metalsmith
 *
 * @return {Object}
 */
const readPartials = (
  partialsPath,
  partialExtension,
  layoutsPath,
  metalsmith
) => {
  const partial_abs = path.isAbsolute(partialsPath)
    ? partialsPath
    : path.join(metalsmith.path(), partialsPath);
  // const layoutsAbs = path.isAbsolute(layoutsPath) ? layoutsPath : path.join(metalsmith.path(), layoutsPath);
  const files = read(partial_abs);

  // Return early if there are no partials
  if (files.length === 0) {
    return {};
  }

  // return list of partials and their respective paths
  return files.reduce((partials, partial) => {
    const file_info = path.parse(partial);
    const name = path.join(file_info.dir, file_info.name);
    const partial_full = path.join(partial_abs, file_info.base);
    partials[name.replace(/\\/g, '/')] = partial_full;
    return partials;
  }, {});
};

// Expose `readPartials`
module.exports = readPartials;
