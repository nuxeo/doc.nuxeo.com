'use strict';
/* eslint-env browser, es6 */

var debounce = require('lodash.debounce');
// var onlyUnique = function (value, index, self) {
//     return self.indexOf(value) === index;
// };

// usage example:
// var a = ['a', 1, 'a', 2, '1'];
// var unique = a.filter(onlyUnique);

module.exports = function($) {
  var $side_menu = $('#side_menu');
  var last_filter = '';
  var min_search_length = 2;

  $side_menu.find('.menu-filter').on(
    'keyup',
    debounce(function() {
      /* eslint no-invalid-this: 0 */
      const $filter = $(this);

      let filter = $filter.val();
      filter = (filter && filter.trim()) || '';

      // console.log('filter', filter);
      var search = new RegExp(filter, 'i');
      var matches = [];
      var matches_string;

      const add_parents = function(id) {
        // console.log('id', id);
        if (!~matches.indexOf(id)) {
          matches.push(id);
        }
        const $this = $('#' + id);
        const parent_id = $this.attr('data-menu-parent');
        if (parent_id && parent_id.length) {
          const $parent_dom = $('[data-menu-id=' + parent_id + ']');
          if ($parent_dom.length) {
            add_parents($parent_dom.attr('id'));
          }
        }
      };

      if (last_filter !== filter && (filter.length > min_search_length || last_filter.length)) {
        if (filter && filter.length > min_search_length) {
          $side_menu.find('li.contains-toc').slideUp();
          $side_menu
            .find('li:not(.contains-toc, .toc-item)')
            .removeClass('open')
            .each(function() {
              var $this = $(this);
              var $link = $this.find('a');
              if (search.exec($link.text())) {
                $link.html($link.text().replace(search, '<span class="highlight">' + filter + '</span>'));
                matches.push($this.attr('id'));
              } else {
                $link.html($link.text());
              }
            });
          matches.forEach(add_parents);

          matches_string = matches.length && '#' + matches.join(',#');
          $side_menu.find(matches_string).slideDown();
          $side_menu.find('li:not(.contains-toc, .toc-item, ' + matches_string + ')').slideUp();

          last_filter = filter;
        } else {
          // console.log('Reset menu');
          $side_menu
            .find('li:not(.contains-toc, .toc-item, [data-init-show=show])')
            .slideUp()
            .end()
            .find('li[data-init-show=show]')
            .slideDown()
            .each(function() {
              var $this = $(this);
              // set open state
              var is_open = $this.attr('data-init-open');
              if (is_open && is_open === 'open') {
                $this.addClass('open');
              } else {
                $this.removeClass('open');
              }
              var $link = $this.find('a');
              $link.html($link.text());
            });
          $side_menu.find('li.contains-toc').slideDown();

          last_filter = '';
        }
      }
    }, 200)
  );
};
