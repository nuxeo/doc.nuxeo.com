'use strict';
/* eslint-env browser, jquery */

var $content = $('#content');

if ($content.has('tabbed')) {
    var $content_clone = $content.clone();
    var $sections = $content_clone.find('> *');
    var $tabs;
    var $tab_sections;
    var $current_section;
    var is_first = true;
    var finished = false;

    $sections.each(function () {
        /* eslint no-invalid-this: 0 */
        var $this = $(this);
        var tag = $this.prop('tagName').toLowerCase();
        if (!finished) {
            if (tag === 'h1') {
                if ($this.hasClass('end-of-tabs')) {
                    // remove and do no more
                    $this.remove();
                    finished = true;
                }
                else {
                    var is_active = '';
                    if (is_first) {
                        is_active = 'is-active';
                        is_first = false;
                        $this.before('<ul id="nuxeo-tabs" class="tabs" data-tabs></ul>');
                        $this.before('<div id="nuxeo-tabs-content" class="tabs-content" data-tabs-content="nuxeo-tabs"></div>');

                        $tabs = $content_clone.find('#nuxeo-tabs');
                        $tab_sections = $content_clone.find('#nuxeo-tabs-content');
                    }
                    var id = $this.attr('id');
                    var heading = $this.text();

                    $tabs.append('<li class="tabs-title ' + is_active + '"><a href="#' + id + '" ' + (is_active ? 'aria-selected="true"' : '') + '>' + heading + '</a></li>');

                    $current_section = $('<div class="tabs-panel ' + is_active + '" id="' + id + '">');
                    $tab_sections.append($current_section);
                    $this.remove();
                }
            }
            else {
                $current_section.append($this.detach());
            }
        }
    });

    // Replace the $content with the cloned version.
    $content.replaceWith($content_clone);
}
