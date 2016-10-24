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

    $('#search-area').click();
});
