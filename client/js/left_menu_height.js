'use strict';
/* eslint-env browser */

module.exports = function ($) {
    var $window = $(window);
    var $side_menu_container = $('#side-menu-container');
    var $footer = $('#footer');
    var footer_pos;
    // var footer_height = $footer.outerHeight(true);
    var menu_height = 50;


    // console.log('footer', footer_height, $window.height());
    $window.on('scroll', function () {
        footer_pos = $footer.offset();
        footer_pos = footer_pos && footer_pos.top;
        var pos = $window.scrollTop();
        var window_height = $window.height();

        var reduced_height = 'calc(100vh - ' + Math.max((pos + window_height) - footer_pos, menu_height) + 'px)';
        if (reduced_height !== $side_menu_container.css('height')) {
            $side_menu_container.css('height', reduced_height);
        }

        var margin_top = (pos >= menu_height ? 0 : menu_height - pos) + 'px';
        if (margin_top !== $side_menu_container.css('margin-top')) {
            // console.log('changed');
            $side_menu_container.css('margin-top', margin_top);
        }
        // console.log('pos', pos, margin_top, $side_menu_container.css('margin-top'), reduced_height);
    });
};
