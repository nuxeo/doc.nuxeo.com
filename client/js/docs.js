'use strict';
/* eslint-env browser */
/* global $ */

$(document).ready(function() {
  require('./modules/polyfills');
  var menu = require('./modules/left_menu');
  var menu_height = require('./modules/left_menu_height');
  var menu_filter = require('./modules/left_menu_filter');
  var satellite_header = require('./satellite_header');

  // Tabbed page
  require('./tabbed');

  // Menu
  if ($('#side_menu').find('div').length) {
    menu_height($);
    menu($);

    // Menu filtering
    menu_filter($);

    // In page TOC
    require('./modules/toc');
  }

  $(document).foundation();

  require('./modules/list_span');

  // Rainbow menu - enable open and close
  var $rainbow_menu = $('#doc-main-menu');
  $('#nuxeo-satellite-header')
    .find('.rainbow-menu')
    .hover(
      function() {
        $rainbow_menu.addClass('active');
      },
      function() {
        $rainbow_menu.removeClass('active');
      }
    );

  // Style codeblocks
  var hljs = require('highlight.js');
  hljs.initHighlightingOnLoad();

  // Add copy icon to codeblocks
  require('./modules/copy_code');

  // Add copy shortlink functionality
  require('./modules/copy_shortlink');

  // Add Keyboard shortcuts
  require('./modules/keyboard_shortcuts');

  // satellite_header
  satellite_header($);

  // menu search
  require('./modules/menu_search');

  // Prodpad Feedback
  require('./modules/prodpad');
});

$(window).on('load', function() {
  // Element supports attribute
  var testAttribute = function(element, attribute) {
    var test = document.createElement(element);
    return !!(attribute in test);
  };

  // If browser doesn't support autofocus
  if (!testAttribute('input', 'autofocus')) {
    $('input[autofocus]').focus();
  }
});
