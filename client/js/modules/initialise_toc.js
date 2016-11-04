'use strict';
/* eslint-env browser, jquery */

var first_time = true;

var initialise_toc = function (override_first) {
    first_time = override_first || first_time;
    // console.log('init-toc', first_time);
    var $content = $('#content');
    var $toc_list = $('#toc_list');
    var no_h4 = $content.hasClass('toc-no-h4');

    $toc_list.find('li').remove();
    var has_tabs = !!$('#nuxeo-tabs').length;
    // var $toc_list_clone = $toc_list.clone();
    // $toc_list_clone.find('li').remove();

    // remove exiting magellan targets
    $('#content').filter('.toc').find('h2[data-magellan-target],h3[data-magellan-target],h4[data-magellan-target]').each(function () {
        $(this).removeAttr('data-magellan-target');
    });

    var $h_tags;
    if (has_tabs) {
        // $h_tags = $content.filter('.toc').find('div.tabs-panel.is-active').find('h2, h3, h4');
        // console.log('$h_tags', $h_tags);
        $h_tags = (no_h4) ? $content.filter('.toc').find('.tabs-panel.is-active h2, .tabs-panel.is-active h3') : $content.filter('.toc').find('.tabs-panel.is-active h2, .tabs-panel.is-active h3, .tabs-panel.is-active h4');
        // console.log('$h_tags', $h_tags);
    }
    else {
        $h_tags = (no_h4) ? $content.filter('.toc').find('h2, h3') : $content.filter('.toc').find('h2, h3, h4');
    }

    var list_item_number = 0;
    var keep_expanded = true;
    $h_tags.each(function () {
        /* eslint no-invalid-this: 0 */
        list_item_number++;
        var list_item_id = 'toc_li_' + list_item_number;
        var $this = $(this);
        var id = $this.attr('id');
        var title = $this.text();
        var classes = $this.prop('tagName').toLowerCase();
        var style = 'style="display: none;"';

        if (classes === 'h2') {
            keep_expanded = false;
        }

        $this.attr('data-magellan-target', id);
        $toc_list.append('<li id="' + list_item_id + '" class="' + classes + '" ' + style + '><a class="button text-left" href="#' + id + '">' + title + '</a></li>');
    });

    // $toc_list.html($toc_list_clone.html());

    if (keep_expanded) {
        $toc_list.addClass('keep-expanded');
        $toc_list.find('li').slideDown();
    }
    else {
        $toc_list.removeClass('keep-expanded');
        $toc_list.find('.h2').slideDown();
    }

    if ($toc_list.foundation && !first_time) {
        try {
            $toc_list.foundation('_init');
            $toc_list.foundation('reflow');
        }
        catch (e) {
            // console.error('Reflow failed');
        }
    }
    first_time = false;
};

module.exports = initialise_toc;
