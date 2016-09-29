'use strict';
/* eslint-env es6 */

const crypto = require('crypto');
const marked = require('marked');
const renderer = new marked.Renderer();
renderer.image = function (href_str, title, alt) {
    // ![alt text](image.png ?w=180,h=360,border=true,thumbnail=true,align=right "title")
    const closing = (this.options.xhtml) ? '/>' : '>';
    const match = /(^.+?)( \?(.*))?$/.exec(href_str);
    const href = match[1];
    const extra_params = (match[3]) ? match[3].split(',') : [];
    const params = extra_params.reduce(function (map, obj) {
        let split = obj.split('=');
        map[split[0]] = split[1];
        return map;
    }, {});

    const div_classes = [];
    const img_classes = [];
    const attrs = [
        `alt="${alt}"`,
        `src="${href}"`
    ];
    if (title) {
        attrs.push(`title="${title}"`);
    }

    const reveal_image = `<img ${attrs.join(' ')} ${closing}`;


    if (params.w) {
        attrs.push(`width="${params.w}"`);
    }
    if (params.h) {
        attrs.push(`height="${params.h}"`);
    }

    // Classes
    if (params.border) {
        img_classes.push('nuxeo');
        img_classes.push('border');
    }
    if (params.thumbnail) {
        img_classes.push('thumbnail');
    }
    if (params.align) {
        div_classes.push('text-' + params.align);
    }

    if (img_classes.length) {
        let classes_join = img_classes.join(' ');
        attrs.push(`class="${classes_join}"`);
    }

    const attributes = attrs.join(' ');
    const md5sum = crypto.createHash('md5');
    md5sum.update('some data to hash');
    const id = 'image_' + md5sum.digest('hex');

    const reveal_div = `
        <div class="large reveal" id="${id}" data-reveal data-animation-in="fade-in" data-animation-out="fade-out">
            ${reveal_image}
            <button class="close-button" data-close aria-label="Close modal" type="button">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    // ${reveal_div}

    return `${reveal_div}<div class="${div_classes.join(' ')}">
        <img ${attributes} data-open="${id}"${closing}
    </div>`;
};

renderer.table = (header, body) => `
    <div class="table-scroll"
        <table>
            <thead>
                ${header}
            </thead>
            <tbody>
                ${body}
            </tbody>
        </table>
    </div>`;

module.exports = renderer;
