'use strict';
/* eslint-env es6 */


const {info, error} = require('../debugger')('nx_assets');
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

const nuxeo = new Nuxeo({
    baseURL: process.env.NX_ASSETS_URL || 'http://localhost:8080/nuxeo',
    auth   : {
        method  : 'basic',
        username: process.env.NX_ASSETS_USER || 'Administrator',
        password: process.env.NX_ASSETS_PWD || 'Administrator'
    },
});

const checksum = (str, algorithm = 'md5', encoding = 'utf-8', digest = 'hex') => crypto
    .createHash(algorithm)
    .update(str, encoding)
    .digest(digest);

const get_attribute = el => (typeof map[el.name] !== 'undefined')
    ? map[el.name]
    : false;

const is_html = file => /\.html?/.test(file);


const check_file = (files, filename, selector) => {

    const file = files[filename];
    const contents = file.contents.toString();
    const $ = cheerio.load(contents);

    const url_promises = new Map();

    $(selector).each((i, el) => {

        const $el = $(el);
        const attr = get_attribute(el);
        const url = $el.attr(attr);
        if (url && url.toLowerCase().search(/^nx_asset?\:\/\//) !== -1 && !url_promises.has(url)) {
            const uid = url.replace(/(^\w+:|^)\/\//, '');
            const promise = nuxeo.repository()
                    .fetch(uid, {schemas: ['dublincore', 'file', 'document_asset']})
                    .then(doc => {

                        // if there is no file return
                        if (!doc.properties['file:content']) {
                            error('nx_asset without file:content');
                            return null;
                        }

                        // build the right url
                        const folder = 'nx_assets';
                        const ext = /(?:\.([^.]+))?$/.exec(doc.properties['file:content'].name)[1];
                        const asset_type = doc.properties['doc_asset:nature'];
                        const asset_file = `${folder}/${uid}+${asset_type}.${ext}`;
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
                                info('asset: %s already exists, ignoring', asset_file);
                                return null;
                            }
                        }
                        return doc.fetchRendition('docAsset')
                            .then(res => {
                                const writable = fs.createWriteStream(asset_file);
                                res.body.pipe(writable);
                                writable.on('finish', function () {
                                    info('Downloaded asset: %s', uid);
                                    writable.close();
                                });
                            });
                    })
                    .catch(err => {
                        throw err;
                    });

            url_promises.set(url, promise);

        }
    });

    return url_promises.values();
};


const doc_assets = () => {
    return (files, metalsmith, done) => {

        const selector = Object.keys(map).join();

        Promise.all(
            Object.keys(files)
                .filter((filename) => files.hasOwnProperty(filename) && is_html(filename))
                .map((filename) => {
                    check_file(files, filename, selector);
                }))
            .then(() => {
                return done();
            })
            .catch((err) => {
                error(err);
                return done(err);
            });

    };
};


/**
 * Expose `doc_assets`
 */
module.exports = doc_assets;
