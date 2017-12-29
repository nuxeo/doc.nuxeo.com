'use strict';

var sortby = require('lodash.sortby');

var sort_object = function(obj) {
  var sorted_array = [];
  Object.keys(obj).forEach(function(key) {
    sorted_array.push({
      key: key,
      values: obj[key]
    });
  });
  sorted_array = sortby(sorted_array, 'key');

  return sorted_array;
};

module.exports = sort_object;
