'use strict';

var head_title = function (options) {
    var title = options.hash.title || options.data.root.title;

    return (title) ? title + ' | ' + options.data.root.site.name : options.data.root.site.name;
};

module.exports = head_title;
