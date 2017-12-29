'use strict';

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

// var svgo_lib = require('svgo');
// var svgo = new svgo_lib();
// var optimize = Promise.promisify(svgo.optimize);

var inline_svg = function(filepath) {
  var svg_path = path.join(__dirname, '../..', filepath);

  return new handlebars.SafeString(fs.readFileSync(svg_path, 'utf8'));
  // .then(function (result) {
  //
  //         console.log(result);

  // {
  //     // optimized SVG data string
  //     data: '<svg width="10" height="20">test</svg>'
  //     // additional info such as width/height
  //     info: {
  //         width: '10',
  //         height: '20'
  //     }
  // }

  // });
  // });
};

module.exports = inline_svg;
