'use strict';
/* eslint-env browser */
/* global $ */

var menu = require('./modules/menu');
var toc = require('./modules/toc');
var tabbed = require('./modules/tabbed');

var domReady = function () {
    // Create tabs if needed
    tabbed.initialise();

    // In page TOC
    toc.initialise();

    // Initialise HighlightJS
    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

};

$(document).ready(function () {
    var satellite_header = require('./satellite_header');

    // Initialise DOM
    domReady();

    // Initialise Foundation
    $(document).foundation();

    // satellite_header
    satellite_header($);

    // Menu
    menu.initialise();

    // Homepage search - Hiding Label when it has results
    require('./modules/home_search');


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

    // Induce focus to search input on homepage
    $('#search-area').click();


    // Initialise pjax
    require('./modules/pjax');

    document.addEventListener('pjax:complete', function () {
        // Initialise DOM
        domReady();

        // Initialise foundation on new element
        $('#content-body').foundation();

        // $(document).foundation('reInit');

        // Refresh menu
        menu.refresh();
    });
});
