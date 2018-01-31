'use strict';
/* eslint-env browser, jquery */

var Clipboard = require('clipboard');

var permalink_selector = '#content_container .heading-group .get_permalink';
var $permalink = $(permalink_selector);
var showTooltip = function(elem, msg) {
  elem.setAttribute('class', 'get_permalink tooltipped tooltipped-sw');
  elem.setAttribute('aria-label', msg);
};

var fallbackMessage = function() {
  var actionMsg = 'Manually copy from URL';
  return actionMsg;
};

var clipboardSnippets = new Clipboard(permalink_selector, {
  text: function(trigger) {
    return window.location.origin + trigger.getAttribute('href');
  }
});
clipboardSnippets.on('success', function(e) {
  console.log('success', e);
  console.info('Action:', e.action);
  console.info('Text:', e.text);
  console.info('Trigger:', e.trigger);
  showTooltip(e.trigger, 'Copied');
});
clipboardSnippets.on('error', function(e) {
  showTooltip(e.trigger, fallbackMessage(e.action));
});

console.log('clib', clipboardSnippets);

$permalink
  .on('click', function(e) {
    e.preventDefault();
    history.pushState('permalink', document.title, $permalink.attr('href'));
  })
  .on('mouseleave', function() {
    /* eslint no-invalid-this: 0 */
    $(this)
      .removeClass('tooltipped tooltipped-sw')
      .removeAttr('aria-label');
  });
