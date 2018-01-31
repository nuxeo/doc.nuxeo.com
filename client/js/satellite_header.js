'use strict';
/* eslint-env browser */

module.exports = function($) {
  var $window = $(window);
  var $satellite_header = $('#nuxeo-satellite-header');
  var $satellite_menu = $satellite_header.find('.nuxeo-satellite-menu');
  var $menu_burger = $satellite_header.find('.menu-burger');
  var burger_breakpoint = 800;

  // Search box (top right)
  var $page_versions = $('#page-versions');
  var $search_button = $('#search-button');
  var $search_box = $('#search-box');
  var $search_box_input = $search_box.find('input');

  $search_button.on('click', function() {
    if ($search_button.hasClass('active')) {
      $search_box_input.blur();
    } else {
      $page_versions.addClass('hide');
      $search_button.addClass('active');
      $search_box.removeClass('closed');
      $search_box_input.focus();
    }
  });
  $search_box_input
    .on('blur', function() {
      $page_versions.removeClass('hide');
      $search_box.addClass('closed');
      $search_button.removeClass('active');
    })
    .on('keyup', function(e) {
      // Escape key
      if (e.which === 27) {
        $(this).blur();
      }
    })
    .on('focus', function() {
      /* eslint no-invalid-this: 0 */
      this.setSelectionRange(0, this.value.length);
    });

  $menu_burger.on('click', function() {
    $satellite_menu.toggleClass('is-open');
  });

  // Burger breakpoint
  $window.on('resize', function() {
    if ($window.width() < burger_breakpoint) {
      $satellite_menu.addClass('is-narrow');
    } else {
      $satellite_menu.removeClass('is-narrow');
    }
  });

  // Initialise
  $window.resize();
};
