module.exports = function($) {
  /* eslint-env browser, jquery */
  const $html = $('html');
  const $main_menu = $('#main_menu');
  const $menu_top = $('#menu-top');

  const drop_persist = '.drop-menu--persist';
  $menu_top.on('click', drop_persist, function() {
    $(this)
      .closest(drop_persist)
      .toggleClass('open');
  });

  $('.hamburger').click(function() {
    $(this).toggleClass('open');
    $main_menu.toggleClass('open');
    $html.toggleClass('no-scroll');
  });

  const whats_new_read = localStorage.getItem('whats_new');
  console.log('whats_new_read', whats_new_read);
  const whats_new_latest = $('#whats_new_latest').attr('data-date');
  console.log('whats_new_latest', whats_new_latest);
};
