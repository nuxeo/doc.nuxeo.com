'use strict';
/* eslint-env es6 */

const crypto = require('crypto');
const striptags = require('striptags');
const slug = require('slug');
slug.defaults.modes.pretty.lower = true;
const marked = require('marked');
const renderer = new marked.Renderer();

const external_url_regex = /(^https?:\/\/|^\/\/|^[a-zA-Z0-9]+\.)/;
const is_external_url = url => external_url_regex.test(url);

const get_href_params = href_str => {
  let href = '';
  let params = {};

  if (href_str) {
    const match = /(^.+?)( \?(.*))?$/.exec(href_str);
    href = match[1];
    const extra_params = match[3] ? match[3].split(',') : [];
    params = extra_params.reduce((map, obj) => {
      const split = obj.split('=');
      map[split[0]] = split[1];
      return map;
    }, {});
  }
  return {
    href,
    params
  };
};

renderer.image = function(href_str, title, alt) {
  // ![alt text](image.png ?w=180,h=360,border=true,thumbnail=true,align=right "title")
  const closing = this.options.xhtml ? '/>' : '>';

  const { href, params } = get_href_params(href_str);

  const div_classes = [];
  const img_classes = [];
  const attrs = [`alt="${alt}"`, `src="${href}"`];
  const max_dimension_for_inline = 32;
  const check_dimension = dimension => {
    if (dimension > max_dimension_for_inline) {
      params.thumbnail = true;
    }
  };

  if (title) {
    attrs.push(`title="${title}"`);
  }

  const reveal_image = `<img ${attrs.join(' ')} ${closing}`;

  if (params.w) {
    check_dimension(params.w);
    attrs.push(`width="${params.w}"`);
  }
  if (params.h) {
    check_dimension(params.h);
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
  if (params.inline) {
    div_classes.push('inline');
  }

  // Defaults to left aligned
  if (params.align) {
    div_classes.push('text-' + params.align);
  }

  if (img_classes.length) {
    let classes_join = img_classes.join(' ');
    attrs.push(`class="${classes_join}"`);
  }

  const attributes = attrs.join(' ');
  if (params.thumbnail) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(attributes);
    const id = 'image_' + md5sum.digest('hex');

    const reveal_div = `
        <div class="large reveal" id="${id}" data-reveal data-animation-in="fade-in" data-animation-out="fade-out">
        ${reveal_image}
        <button class="close-button" data-close aria-label="Close modal" type="button">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `;

    return `${reveal_div}<div class="${div_classes.join(' ')}">
        <img ${attributes} data-open="${id}"${closing}
        </div>`;
  } else {
    return `<img ${attributes}${closing}`;
  }
};

renderer.table = (header, body) => `
    <div class="table-scroll">
        <table>
            <thead>
                ${header}
            </thead>
            <tbody>
                ${body}
            </tbody>
        </table>
    </div>`;

renderer.list = function(body, ordered) {
  const type = ordered ? 'ol' : 'ul';
  const attrs = {
    type: '',
    start: ''
  };

  if (+ordered || +ordered === 0) {
    if (+ordered !== 1) {
      attrs.start = `start="${ordered}"`;
    }
  } else {
    const type_case = ordered === ordered.toUpperCase() ? 'A' : 'a';
    attrs.type = `type="${type_case}"`;
    const start_letter =
      ordered
        .toString()
        .toUpperCase()
        .charCodeAt(0) - 64;
    attrs.start = start_letter > 1 && start_letter < 9 ? `start="${start_letter}"` : '';
  }
  const attr = [attrs.type, attrs.start].filter(x => x).join(' ');

  return `<${type} ${attr}>
    ${body}
    </${type}>
    `;
};

renderer.link = function(href_str, title, text) {
  const { href, params } = get_href_params(href_str);
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    /* eslint no-script-url: 0 */
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return '';
    }
  }

  const attrs = [`href="${href}"`];
  if (title) {
    attrs.push(`title="${title}"`);
  }
  if (params.external || is_external_url(href)) {
    attrs.push('target="_blank"');
  }

  const attributes = attrs.join(' ');

  return `<a ${attributes}>${text}</a>`;
};

renderer.heading = (text, level) => {
  const text_slug = slug(striptags(text.replace(/\{\{[^}]*?\}\}/g, '')));

  // return `<h${level} id="${text_slug}">${text}</h${level}>`;
  return `<h${level} id="${text_slug}"><a href="#${text_slug}" class="heading-anchor"><i class="fa fa-link"></i></a>${text}</h${level}>`;
};

module.exports = renderer;
