'use strict';
/* eslint-env es6, browser, jquery */

const decode_url = require('html-entities').decode;
const search = window.location.search;

if (search) {
  // e.g. '?q=search+string'
  const search_regex = /(\?|&)q=([^&]+)/i;
  const match = search_regex.exec(search);

  if (match && match[2]) {
    /* eslint new-cap:0 */
    const search_text = decode_url(match[2]);
    const event = jQuery.Event('keyup');
    event.which = 32;

    $('#search-input-full')
      .val(search_text)
      .focus()
      .trigger(event);
  }
}
