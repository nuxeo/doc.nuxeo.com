'use strict';
/* eslint-env browser */
/* global $, side_menu_data */

$(document).ready(function () {
    // var menu = require('./menu');
    var menu_height = require('./left_menu_height');
    var satellite_header = require('./satellite_header');

    // Menu
    if (typeof side_menu_data !== 'undefined') {
        menu_height($);
        // menu();
    }

    // Tabbed page
    require('./tabbed');

    // In page TOC
    require('./toc');

    $(document).foundation();

    require('./modules/list_span');

    // Rainbow menu - enable open and close
    var $rainbow_menu = $('#doc-main-menu');
    $('#nuxeo-satellite-header').find('.rainbow-menu').hover(function () {
        $rainbow_menu.addClass('active');
    }, function () {
        $rainbow_menu.removeClass('active');
    });

    // Style codeblocks
    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

    // Add copy icon to codeblocks
    require('./modules/copy_code');

    // Homepage search - focus on click
    var $search_area = $('#search-area');
    var $search_input_full = $('#search-input-full');
    $search_area.on('click', function () {
        $search_input_full.focus();
    });

    // satellite_header
    satellite_header($);
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
