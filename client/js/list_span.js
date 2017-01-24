'use strict';
/* eslint-env browser, jquery */

// Adds a div around empty li elements so they can be limited in width
var $content = $('#content');
$content.find('li:not(:has(p, pre))').wrapInner('<div></div>');
