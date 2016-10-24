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

    // Search box (top right)
    var $search_button = $('#search-button');
    var $search_box = $('#search-box');
    var $search_box_input = $search_box.find('input');

    $search_button.on('click', function () {
        if ($search_button.hasClass('active')) {
            $search_box_input.blur();
        }
        else {
            $search_button.addClass('active');
            $search_box.removeClass('closed');
            $search_box_input.focus();
        }
    });
    $search_box_input.on('blur', function () {
        $search_box.addClass('closed');
        $search_button.removeClass('active');
    })
    .on('focus', function () {
        /* eslint no-invalid-this: 0 */
        this.setSelectionRange(0, this.value.length);
    });

    // Menu
    menu($);
});

$(window).load(function () {
    // Element supports attribute
    var testAttribute = function (element, attribute) {
        var test = document.createElement(element);
        return !!(attribute in test);
    };

    // If browser doesn't support autofocus
    if (!testAttribute('input', 'autofocus')) {
        $('input[autofocus]').focus();
    }
});
