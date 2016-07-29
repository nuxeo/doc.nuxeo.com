'use strict';

var marked = require('marked');
var renderer = new marked.Renderer();
renderer.image = function (href_str, title, alt) {
    // ![alt text](image.png ?w=180,h=360,border=true,thumbnail=true,align=right "title")
    var match = /(^.+?)( \?(.*))?$/.exec(href_str);
    var href = match[1];
    var extra_params = (match[3]) ? match[3].split(',') : [];
    var params = extra_params.reduce(function (map, obj) {
        var split = obj.split('=');
        map[split[0]] = split[1];
        return map;
    }, {});

    var classes = [];
    var attrs = [
        'alt="' + alt + '"',
        'src="' + href + '"'
    ];
    if (params.w) {
        attrs.push('width="' + params.w + '"');
    }
    if (params.h) {
        attrs.push('height="' + params.h + '"');
    }
    if (title) {
        attrs.push('title="' + title + '"');
    }

    // Classes
    if (params.border) {
        classes.push('border');
    }
    if (params.thumbnail) {
        classes.push('thumbnail');
    }
    if (params.align) {
        classes.push('float-' + params.align);
    }
    if (classes.length) {
        attrs.push('class="' + classes.join(' ') + '"');
    }

    return '<img ' + attrs.join(' ') + (this.options.xhtml ? '/>' : '>');
};

module.exports = renderer;
