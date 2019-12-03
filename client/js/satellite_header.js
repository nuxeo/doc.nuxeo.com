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
};
