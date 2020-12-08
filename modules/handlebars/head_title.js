'use strict';

var head_title = function (options) {
  var file = options.data.root;
  var title = options.hash.title || file.title;

  return title ? title + ' | ' + file.site.name : file.site.name;
};

module.exports = head_title;
