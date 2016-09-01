'use strict';
/* eslint-env browser */
/* global $ */

$(document).ready(function () {
    var menu = require('./menu');

    // In page TOC
    require('./tabbed');

    // In page TOC
    require('./toc');

    $(document).foundation();

    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

    var $search_button = $('.search-button');
    var $search_box = $('#search-box');

    $search_button.on('click', function () {
        $search_button.addClass('active');
        $search_box.removeClass('hide').find('input').focus();
    });
    $search_box.find('input').on('blur', function () {
        $search_box.addClass('hide');
        $search_button.removeClass('active');
    })
    .on('focus', function () {
        /* eslint no-invalid-this: 0 */
        this.setSelectionRange(0, this.value.length);
    });

    // Menu
    menu($);
});
