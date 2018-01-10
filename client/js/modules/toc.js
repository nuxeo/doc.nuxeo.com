'use strict';
/* eslint-env browser, jquery */

var debounce = require('lodash.debounce');
// var throttle = require('lodash.throttle');

var initialise_toc = require('./initialise_toc');

var $content = $('#content');
var $side_menu_container = $('#side_menu_container');
var $toc = $content.filter('.toc');

var $toc_list = $('#toc_list');

var buffer_height = 100;
var slide_speed = 400;
var can_scroll_list = true;
//
var toc_active_position;

// Initialise toc
if ($toc.length) {
  initialise_toc();

  // On magellan (scroll-spy) change ensure current item is visible.
  $toc_list.on(
    'update.zf.magellan',
    debounce(function() {
      var $active_li = $toc_list.find('.is-active').closest('li');
      if ($active_li.length) {
        var active_position = $active_li.position().top;

        if (toc_active_position !== active_position) {
          var keep_expanded = $toc_list.hasClass('keep-expanded');
          var active_id = $active_li.attr('id');
          if (!keep_expanded) {
            var $lis = $toc_list.find('li');
            var current_lis = [];
            var found_active = false;
            var all_found = false;
            // Find closest h2 and children of active
            $lis.each(function() {
              /* eslint no-invalid-this: 0 */
              var $this = $(this);
              var is_h2 = $this.hasClass('h2');
              if (!all_found) {
                if (!found_active) {
                  if (is_h2) {
                    current_lis = [];
                  }
                  if (active_id === $this.attr('id')) {
                    found_active = true;
                  }
                } else {
                  if (is_h2) {
                    all_found = true;
                  }
                }
                if (!all_found && !is_h2) {
                  current_lis.push($this.attr('id'));
                }
              }
            });

            if (current_lis.length) {
              var expand_selector = '#' + current_lis.join(', #');
              $toc_list
                .find('.h3, .h4')
                .not(expand_selector)
                .slideUp(slide_speed);
              $toc_list.find(expand_selector).slideDown(slide_speed);
            } else {
              $toc_list.find('.h3, .h4').slideUp(slide_speed);
            }
          }

          if (can_scroll_list) {
            setTimeout(function() {
              $side_menu_container.stop(true);
              // Total height of list within scroll area
              // var list_height = $toc_list[0].scrollHeight;
              var scroll_position = $side_menu_container.scrollTop();
              toc_active_position = $active_li.position().top;

              // console.log('list_height:', list_height);
              // console.log('active_position:', active_position);
              // console.log('scroll_position:', $toc_list.scrollTop());

              // Scroll to display the current item (20% from top if possible)
              var position =
                scroll_position + toc_active_position - buffer_height;
              position = position < 0 ? 0 : position;
              // console.log('list_position:', position);
              $side_menu_container.animate(
                {
                  scrollTop: position
                },
                slide_speed
              );
            }, slide_speed);
          }
        }
      }
    }, 200)
  );

  // Cancel scrolling upon hover
  $side_menu_container.on('mouseenter', function() {
    $side_menu_container.stop(true);
    can_scroll_list = false;
  });
  $side_menu_container.on('mouseleave', function() {
    can_scroll_list = true;
  });
}
