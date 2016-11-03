'use strict';
/* eslint-env browser */
/* global $ */

var menu = require('./modules/menu');

$(document).ready(function () {
    var satellite_header = require('./satellite_header');

    // Create tabs if needed
    require('./modules/tabbed');

    // In page TOC
    require('./modules/toc');

    // Initialise Foundation
    $(document).foundation();

    // Initialise HighlightJS
    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

    // Homepage search - Hiding Label when it has results
    require('./modules/home_search');

    // satellite_header
    satellite_header($);

    // Menu
    menu.initialise();
});

$(window).load(function () {
    var initialise_toc = require('./modules/initialise_toc');
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

    require('./modules/pjax');

    document.addEventListener('pjax:success', function () {
        initialise_toc(true);
        $('.pjax-content').foundation();
        menu.refresh();
    });
});
