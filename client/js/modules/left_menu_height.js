'use strict';
/* eslint-env browser */

module.exports = function($) {
  var $window = $(window);
  var $side_menu_container = $('#side_menu_container');
  var $footer = $('#docs_footer');
  var $goto_top = $('#goto_top');
  var footer_pos;
  // var footer_height = $footer.outerHeight(true);
  var menu_height = 50;

  // console.log('footer', footer_height, $window.height());
  $window.on('scroll', function() {
    footer_pos = $footer.offset();
    footer_pos = footer_pos && footer_pos.top;
    var pos = $window.scrollTop();
    var window_height = $window.height();

    var margin_top_value = pos >= menu_height ? 0 : menu_height - pos;
    var margin_top = margin_top_value + 'px';
    if (margin_top !== $side_menu_container.css('margin-top')) {
      // console.log('changed');
      $side_menu_container.css('margin-top', margin_top);
    }

    var reduced_height_footer_value = margin_top_value + pos + window_height - footer_pos;
    var reduced_height = 'calc(100vh - ' + Math.max(reduced_height_footer_value, 0) + 'px)';
    if (reduced_height !== $side_menu_container.css('height')) {
      $side_menu_container.css('height', reduced_height);
    }
    // console.log('pos', pos, margin_top, $side_menu_container.css('margin-top'), reduced_height);

    // console.log('reduced_height_footer_value', reduced_height_footer_value);
    // console.log('margin_top_value', margin_top_value);
    if (reduced_height_footer_value > 0) {
      $goto_top.addClass('visible bottom').removeClass('fixed');
    } else if (!margin_top_value) {
      $goto_top.addClass('visible fixed').removeClass('bottom');
    } else {
      $goto_top.removeClass('visible bottom fixed');
    }
  });

  $goto_top.on('click', function() {
    // console.log('clicked to top');
    $('body, html').animate({ scrollTop: 0 }, 500);
  });

  // Initialise
  setTimeout(function() {
    $window.scroll();
  }, 1);
};
