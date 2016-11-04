'use strict';
/* eslint-env browser */

var Pjax = require('pjax');

/* eslint no-new:0 */
window.pjax = new Pjax({
    elements : ['a'],
    selectors: ['title', '#content-body']
});
