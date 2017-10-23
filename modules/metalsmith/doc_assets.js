'use strict';
/* eslint-env es6 */


const {info, error} = require('./../debugger')('nx_assets');
const fs = require('fs');
const crypto = require('crypto');
const Nuxeo = require('nuxeo');
const cheerio = require('cheerio');

const map = {
    // 'a'     : 'href',
    // 'link'  : 'href',
    // 'script': 'src',
    'img'  : 'src',
    'video': 'src',
    'audio': 'src'
    // 'source': 'src'
};


const checksum = function (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
};

const get_attribute = function getAttribute (el) {
    return (typeof map[el.name] !== 'undefined')
        ? map[el.name]
        : false;
};

const is_html = function isHTML (file) {
    return /\.html?/.test(file);
};


const check_file = (files, filename, selector, nuxeo) => {
    return new Promise(function (resolve) {

        const file = files[filename];

        const contents = file.contents.toString();
        const $ = cheerio.load(contents);

        const url_promises = [];

        $(selector).each(function (i, el) {

            const $el = $(el);
            const attr = get_attribute(el);
            const url = $el.attr(attr);
            if (url && url.search(/^nx_asset?\:\/\//) !== -1) {
                const uid = url.replace(/(^\w+:|^)\/\//, '');
                const p = nuxeo.repository()
                    .fetch(uid, {schemas: ['dublincore', 'file', 'document_asset']})
                    .then(function (doc) {

                        // if there is no file return
                        if (!doc.properties['file:content']) {
                            error('nx_asset without file:content');
                            return null;
                        }

                        // build the right url
                        const folder = 'nx_assets';
                        const ext = /(?:\.([^.]+))?$/.exec(doc.properties['file:content'].name)[1];
                        const asset_type = doc.properties['doc_asset:nature'];
                        const asset_file = folder + '/' + uid + '+' + asset_type + '.' + ext;
                        const href = '/' + asset_file;

                        $el.attr(attr, href);
                        const html = $.html();
                        file.contents = new Buffer(html);
                        files[filename] = file;

                        // if file already exist in fs
                        if (fs.existsSync(asset_file)) {
                            const content = fs.readFileSync(asset_file);
                            const file_digest = checksum(content, doc.properties['file:content'].digestAlgorithm);

                            // if digest matches ignore
                            if (file_digest === doc.properties['file:content'].digest) {
                                info('asset: %s already exists, ignoring', uid);
                                return null;
                            }
                        }
                        return doc.fetchRendition('docAsset')
                            .then(function (res) {
                                const writable = fs.createWriteStream(asset_file);
                                res.body.pipe(writable);
                                writable.on('finish', function () {
                                    info('Downloaded asset: %s', uid);
                                    writable.close();
                                });
                            });
                    })
                    .catch(function (err) {
                        throw err;
                    });

                url_promises.push(p);
            }

            Promise.all(url_promises)
                .then(() => {
                    return resolve();
                })
                .catch((err) => {
                    error(err);
                    return resolve();
                });
        });

    });
};


const doc_assets = function () {

    return function (files, metalsmith, done) {

        const nuxeo = new Nuxeo({
            baseURL: process.env.NX_ASSETS_URL || 'http://localhost:8080/nuxeo',
            auth   : {
                method  : 'basic',
                username: process.env.NX_ASSETS_USER || 'Administrator',
                password: process.env.NX_ASSETS_PWD || 'Administrator'
            },
        });

        const file_promises = [];

        for (const filename in files) {

            if (!files.hasOwnProperty(filename)) {
                continue;
            }

            if (!is_html(filename)) {
                continue;
            }

            const selector = Object.keys(map).join();
            file_promises.push(check_file(files, filename, selector, nuxeo));

        }

        Promise.all(file_promises)
            .then(() => {
                return done();
            })
            .catch((err) => {
                error(err);
                return done();
            });

    };


};

/**
 * Expose `doc_assets`
 */
module.exports = doc_assets;
