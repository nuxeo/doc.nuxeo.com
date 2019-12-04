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

  const $whats_new = $('#whats_new');

  let whats_new_read = localStorage.getItem('whats_new');
  // console.log('whats_new_read', whats_new_read);
  const whats_new_latest = $('#whats_new_latest').attr('data-date');
  // console.log('whats_new_latest', whats_new_latest);

  if (whats_new_read === null) {
    $whats_new
      .addClass('open')
      .find('.whats-new')
      .addClass('whats-new--alert');
  } else if (whats_new_latest && whats_new_read < whats_new_latest) {
    $whats_new.find('.whats-new').addClass('whats-new--alert');
  }

  $whats_new.on('click', function() {
    if (whats_new_latest && whats_new_read !== whats_new_latest) {
      localStorage.setItem('whats_new', whats_new_latest);
      whats_new_read = whats_new_latest;
      $whats_new.find('.whats-new').removeClass('whats-new--alert');
    }
  });
};
