'use strict';
/* eslint-env browser, jquery */

var Clipboard = require('clipboard');

var showTooltip = function (elem, msg) {
  elem.setAttribute('class', 'copy-button tooltipped tooltipped-w');
  elem.setAttribute('aria-label', msg);
};

var fallbackMessage = function (action) {
  var actionMsg = '';
  var actionKey = action === 'cut' ? 'X' : 'C';
  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = 'No support :(';
  } else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
  } else {
    actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
  }
  return actionMsg;
};

$('pre').prepend(
  '<div class="copy-area"><button class="copy-button" data-clipboard-snippet><img class="clippy" width="13" src="/assets/imgs/icons/clipboard-copy.svg" alt="Copy to clipboard"></button></div>'
);
$('.copy-button').on('mouseleave', function () {
  /* eslint no-invalid-this: 0 */
  $(this).removeClass('tooltipped tooltipped-w').removeAttr('aria-label');
});

var clipboardSnippets = new Clipboard('[data-clipboard-snippet]', {
  target: function (trigger) {
    return trigger.parentElement.nextElementSibling;
  },
});
clipboardSnippets.on('success', function (e) {
  e.clearSelection();
  showTooltip(e.trigger, 'Copied');
});
clipboardSnippets.on('error', function (e) {
  showTooltip(e.trigger, fallbackMessage(e.action));
});
