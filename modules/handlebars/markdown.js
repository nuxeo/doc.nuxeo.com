'use strict';

// var debug  = require('debug')('handlebars-markdown');
var marked     = require('marked');
var handlebars = require('handlebars');

var hb_constructor = function (md_options) {
    var markdown = function (text, options) {
        /* eslint no-invalid-this:0 */
        if (options) {
            return marked(text || '', md_options);
        }
        else {
            options = text;
            return new handlebars.SafeString(marked(options.fn(this), md_options));
        }
    };
    return markdown;
};

module.exports = hb_constructor;
