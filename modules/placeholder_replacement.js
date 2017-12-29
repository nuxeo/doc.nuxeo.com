'use strict';
var debug = require('debug');
var log = debug('placeholder-replacement');
var error = debug('placeholder-replacement:error');
var slug_string = require('slug');
slug_string.defaults.modes.pretty.lower = true;
var slug_nothing = function(x) {
  return x;
};

var get = require('lodash.get');
var placeholder_replacement = function placeholder_replacement(
  string_pattern,
  data,
  slug_elements
) {
  var slug = slug_elements ? slug_string : slug_nothing;
  var string_replaced = '';

  log('Building string from: %s', string_pattern);

  /**
   * Get the params from a `pattern` string.
   *
   * @param {String} pattern
   * @return {Array}
   */
  var get_params = function get_params(pattern) {
    /* eslint no-cond-assign: 0 */
    var matcher = /:([\w]+(\.[\w]+)*)/g;
    var ret = [];
    var m;
    while ((m = matcher.exec(pattern))) {
      ret.push(m[1]);
    }
    return ret;
  };

  if (string_pattern) {
    var pattern = string_pattern;
    var params = get_params(pattern);

    params.forEach(function(element) {
      var replacement = get(data, element);
      if (replacement) {
        pattern = pattern.replace(':' + element, slug(replacement.toString()));
      }
    });

    // Check all have been processed
    if (get_params(pattern).join('') === '') {
      string_replaced = pattern;
    } else {
      error("Couldn't build string from: %s - %o", pattern, data);
      throw new TypeError("Couldn't build string from: " + pattern);
    }
  }
  return string_replaced;
};

module.exports = placeholder_replacement;
