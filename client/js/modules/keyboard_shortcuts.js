'use strict';
/* eslint-env browser, jquery */

$(document).on('keyup', function(e) {
  if (e.target.tagName !== 'INPUT') {
    if (e.which === 75) {
      // k shortcut
      e.preventDefault();
      $('#content_container .heading-group .get_permalink').click();
    } else if (e.which === 83) {
      // s shortcut
      e.preventDefault();
      $('#search-button').click();
    } else if (e.which === 70) {
      // f shortcut
      e.preventDefault();
      $('#side_menu .menu-filter').focus();
    }
  }
});
