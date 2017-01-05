'use strict';
/* eslint-env browser */
/* global $ */

$(document).ready(function () {
    var menu = require('./menu');
    var menu_height = require('./left_menu_height');
    var satellite_header = require('./satellite_header');

    // Menu
    menu_height($);
    menu();

    // Tabbed page
    require('./tabbed');

    // In page TOC
    require('./toc');

    $(document).foundation();

    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

    var $rainbow_menu = $('#doc-main-menu');
    $('#nuxeo-satellite-header').find('.rainbow-menu').hover(function () {
        $rainbow_menu.addClass('active');
    }, function () {
        $rainbow_menu.removeClass('active');
    });

    // Homepage search - Hiding Label when it has results
    var $search_area = $('#search-area');
    if ($search_area.length) {
        var $input_group_label = $search_area.find('.input-group-label');
        $search_area.on('click', function () {
            var $this = $(this);
            var $input = $this.find('input.gsc-input');
            $input.focus();
        })
        .on('focus', 'input.gsc-input', function () {
            /* eslint no-invalid-this: 0 */
            $(this).keyup();
            this.setSelectionRange(0, this.value.length);
        })
        .on('keyup', 'input.gsc-input', function () {
            setTimeout(function () {
                if ($search_area.find('.gsc-results').length && !$search_area.find('.gs-result.gs-no-result').length) {
                    $input_group_label.addClass('closed');
                }
                else {
                    $input_group_label.removeClass('closed');
                }
            }, 1e3);
        });

        $search_area.click();
    }


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

    $('#search-area').click();
});
