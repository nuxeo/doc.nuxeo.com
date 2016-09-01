'use strict';
/* eslint-env browser, jquery */

// var throttle = require('lodash.throttle');
var throttle = require('lodash.throttle');

var $window = $(window);
var $document = $(document);
var $content = $('#content');
var $toc = $('#toc');
var $toc_list = $('#toc_list');

var $toc_list_clone = $toc_list.clone();
var $h_tags = $content.filter('.toc').find('h2, h3, h4');
var $toc_nav = $toc.find('nav');

var margin = 16;
var list_item_number = 0;

var viewport_height;
var toc_active_position;

// Initialise toc
if ($toc.length && $h_tags.length) {
    $h_tags.each(function () {
        /* eslint no-invalid-this: 0 */
        list_item_number++;
        var list_item_id = 'toc_li_' + list_item_number;
        var $this = $(this);
        var id = $this.attr('id');
        var title = $this.text();
        var classes = $this.prop('tagName').toLowerCase();
        var style = (classes !== 'h2') ? 'style="display: none;"' : '';

        $this.attr('data-magellan-target', id);
        $toc_list_clone.append('<li id="' + list_item_id + '" class="' + classes + '" ' + style + '><a class="button text-left" href="#' + id + '">' + title + '</a></li>');
    });
    $toc_list.html($toc_list_clone.html());

    $window.on('resize', function () {
        viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        // console.log('viewport height:', viewport_height);
    });
    $window.resize();


    // On scroll adjust TOC height
    $window.on('scroll', function () {
        var page_position = $document.scrollTop();
        var stuck_at_top = $toc_nav.hasClass('is-stuck') && $toc_nav.hasClass('is-at-top');
        var content_bottom = $content.offset().top + $content.outerHeight(true);

        // console.log('content_bottom:', content_bottom);
        // console.log('stuck_at_top:', stuck_at_top);
        // console.log('page_position:', page_position);
        // console.log('content_bottom:', content_bottom);

        var height = '';
        if (!stuck_at_top) {
            // console.log('nav_offset:', $toc_nav.offset().top);
            height = viewport_height + page_position - $toc_nav.offset().top - margin;
        }
        else if (stuck_at_top) {
            var overlap = (page_position + viewport_height) - content_bottom;
            // console.log('overlap:', overlap);
            if (overlap > 0) {
                height = viewport_height - (overlap + (margin * 2));
            }
        }
        // console.log('height:', height);
        $toc_list.height(height);
    });
    $window.scroll();


    // On magellan (scroll-spy) change ensure current item is visible.
    $toc_list.on('update.zf.magellan', throttle(function () {
        var $active_li = $toc_list.find('.active').closest('li');
        var active_position = $active_li.position().top;

        if (toc_active_position !== active_position) {
            var active_id = $active_li.attr('id');
            var $lis = $toc_list.find('li');
            var current_lis = [];
            var found_active = false;
            var all_found = false;
            // Find closest h2 and children of active
            $lis.each(function () {
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
                    }
                    else {
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
                $toc_list.find('.h3, .h4').not(expand_selector).slideUp();
                $toc_list.find(expand_selector).slideDown();
            }
            else {
                $toc_list.find('.h3, .h4').slideUp();
            }


            // Total height of list within scroll area
            // var list_height = $toc_list[0].scrollHeight;
            var scroll_position = $toc_list.scrollTop();
            toc_active_position = active_position;
            // 20% of visible height
            var one_fifth_height = $toc_list.height() / 5;
            // console.log('list_height:', list_height);
            // console.log('active_position:', active_position);
            // console.log('scroll_position:', $toc_list.scrollTop());

            // Scroll to display the current item (20% from top if possible)
            var position = (scroll_position + active_position - one_fifth_height);
            position = (position < 0) ? 0 : position;
            // console.log('list_position:', position);
            $toc_list.animate({
                scrollTop: position
            }, 500);
        }
    }, 200));
}
