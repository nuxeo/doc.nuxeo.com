'use strict';
/* eslint-env browser */
/* global $ */

$(document).ready(function () {
    var menu = require('./menu');

    // In page TOC
    (function () {
        var $content = $('#content');
        var $toc = $('#toc');
        var $toc_list = $toc.find('#toc_list');
        var $toc_list_clone = $toc_list.clone();
        var $h_tags = $content.filter('.toc').find('h2, h3, h4');
        if ($toc.length && $h_tags.length) {
            $h_tags.each(function () {
                var $this = $(this);
                var id = $this.attr('id');
                var title = $this.text();

                $this.attr('data-magellan-target', id);
                $toc_list_clone.append('<li class="' + $this.prop('tagName').toLowerCase() + '"><a class="button text-left" href="#' + id + '">' + title + '</a></li>');
            });
            $toc_list.html($toc_list_clone.html());
        }
    }());

    $(document).foundation();

    var hljs = require('highlight.js');
    hljs.initHighlightingOnLoad();

    var $search_button = $('.search-button');
    var $search_box = $('#search-box');

    $search_button.on('click', function () {
        $search_button.addClass('active');
        $search_box.removeClass('hide').find('input').focus();
    });
    $search_box.find('input').on('blur', function () {
        $search_box.addClass('hide');
        $search_button.removeClass('active');
    })
    .on('focus', function () {
        /* eslint no-invalid-this: 0 */
        this.setSelectionRange(0, this.value.length);
    });

    // Menu
    menu($);
});
