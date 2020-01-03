// Debugging
const { debug } = require('./debugger')('get-unique-hash');

const crypto = require('crypto');

const get_hash = text =>
  crypto
    .createHash('sha256')
    .update(text)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const get_unique_hash = hash_reference => filepath => {
  const hash = get_hash(filepath);
  const shortlink_values = Object.keys(hash_reference).map(
    key => hash_reference[key]
  );
  const len_max = 16;
  let len = 3;

  debug('shortlink_values', shortlink_values);
  debug('hash', hash);
  debug('hash-', hash.substr(0, len));
  while (shortlink_values.includes(hash.substr(0, len)) && len < len_max) {
    len++;
    debug('hash--', hash.substr(0, len));
    debug('includes', shortlink_values.includes(hash.substr(0, len)));
  }
  return len >= len_max ? false : hash.substr(0, len);
};

module.exports = get_unique_hash;
