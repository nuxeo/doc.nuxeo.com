'use strict';
/* eslint-env browser */

module.exports = function ($) {
  var $side_menu = $('#side_menu');

  $side_menu.find('.has-control > i').on('click', function () {
    /* eslint no-invalid-this: 0 */
    var $this = $(this);
    var $parent = $this.parent();
    var id = $parent.attr('data-menu-id');
    var level = $parent.attr('data-menu-level');

    if (id) {
      if ($parent.hasClass('open')) {
        // console.log('Close');
        $parent.removeClass('open');
        $side_menu
          .find('li.p' + id)
          .slideUp()
          .removeClass('open');
      } else {
        // console.log('Open');
        $parent.addClass('open');
        $side_menu.find('li.p' + id + '.l' + (+level + 1)).slideDown();
      }
    }
  });
};
