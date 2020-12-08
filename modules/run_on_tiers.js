'use strict';
/* eslint-env es6 */

/**
 * Runs a function against an array and its children
 *
 * @param  {Array} arr       Array for function to process
 * @param  {Function} func   Function to run aginst the array
 * @param  {Object} settings Settings to pass to the function
 *
 * @return {Void}
 */
const run_on_tiers = function run_on_tiers(arr, func, settings) {
  if (Array.isArray(arr)) {
    arr.forEach((entry) => {
      // if it has children
      if (entry.children && entry.children.length) {
        run_on_tiers(entry.children, func, settings);
      }
    });
    func(arr, settings);
  } else if (arr && arr.children && arr.children.length) {
    run_on_tiers(arr.children, func, settings);
  }
};

module.exports = run_on_tiers;
