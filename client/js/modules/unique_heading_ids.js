'use strict';
/* eslint-env browser, jquery */

// Amend duplicate ids if present
var ids = {};
$('*[id]').each(function () {
    /* eslint no-invalid-this: 0 */
    var $this = $(this);
    var id = $this.attr('id');
    if (ids[id]) {
        $this.attr('id', id + '-' + ++ids[id].count);
    }
    else {
        ids[id] = {
            count: 0
        };
    }
});
ids = void 0;
