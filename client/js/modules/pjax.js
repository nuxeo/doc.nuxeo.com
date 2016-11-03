'use strict';
/* eslint-env browser, jquery */

var Pjax = require('pjax');

// var $body = $('body');
//
// Pjax.prototype.getElements = function () {
//     return $body.find('a');
// };

/* eslint no-new:0 */
window.pjax = new Pjax({
    elements : ['a'],
    selectors: ['title', '#content-body']
});
