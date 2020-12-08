'use strict';
/* eslint-env browser, jquery */

var initialise_toc = function () {
  // Add magellan-target to headings where appropriate
  var $content = $('#content');
  var no_h4 = $content.hasClass('toc-no-h4');

  var $h_tags = no_h4
    ? $content.filter('.toc').find('h2, h3')
    : $content.filter('.toc').find('h2, h3, h4');

  $h_tags.each(function () {
    /* eslint no-invalid-this: 0 */
    var $this = $(this);
    var id = $this.attr('id');

    $this.attr('data-magellan-target', id);
  });
};

module.exports = initialise_toc;
