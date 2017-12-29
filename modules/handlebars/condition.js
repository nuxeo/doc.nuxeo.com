'use strict';
var debug_lib = require('debug');
// var debug         = debug_lib('handlebars-condition');
var error = debug_lib('handlebars-condition:error');

var condition = function(v1, operator, v2) {
  var types = {
    '==': function() {
      /* eslint eqeqeq: 0 */
      return v1 == v2;
    },
    '===': function() {
      return v1 === v2;
    },
    '!=': function() {
      /* eslint eqeqeq: 0 */
      return v1 != v2;
    },
    '!==': function() {
      return v1 !== v2;
    },
    '<': function() {
      return v1 < v2;
    },
    '<=': function() {
      return v1 <= v2;
    },
    '>': function() {
      return v1 > v2;
    },
    '>=': function() {
      return v1 >= v2;
    },
    '&&': function() {
      return v1 && v2;
    },
    '||': function() {
      return v1 || v2;
    },
    regex: function() {
      return RegExp(v2, 'i').test(v1);
    },
    indexOf: function() {
      return v1.indexOf(v2);
    }
  };

  if (typeof types[operator] === 'function') {
    return types[operator]();
  } else {
    error('Operator: %s not defined!', operator);
    return false;
  }
};

module.exports = condition;
