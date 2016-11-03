'use strict';
/* eslint-env browser, jquery */

var $search_area = $('#search-area');
if ($search_area.length) {
    var $input_group_label = $search_area.find('.input-group-label');
    $search_area.on('click', function () {
        var $this = $(this);
        var $input = $this.find('input.gsc-input');
        $input.focus();
    })
    .on('focus', 'input.gsc-input', function () {
        /* eslint no-invalid-this: 0 */
        $(this).keyup();
        this.setSelectionRange(0, this.value.length);
    })
    .on('keyup', 'input.gsc-input', function () {
        setTimeout(function () {
            if ($search_area.find('.gsc-results').length && !$search_area.find('.gs-result.gs-no-result').length) {
                $input_group_label.addClass('closed');
            }
            else {
                $input_group_label.removeClass('closed');
            }
        }, 1e3);
    });

    $search_area.click();
}
