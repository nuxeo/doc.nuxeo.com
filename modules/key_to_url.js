/**
 * Key To URL
 * Returns a URL for a key
 *
 * @param  {String} key
 * @param  {Object} pages
 * @return {String}
 */
module.exports = (key, pages) => {
  if (!key) {
    throw new Error('Key not provided');
  } else if (!pages) {
    throw new Error('Pages object not provided');
  } else if (!pages[key]) {
    throw new Error(`Key: "${key}" not in pages`);
  } else if (!pages[key].url || !pages[key].url) {
    throw new Error(`Key: "${key}" doesn't have url set`);
  } else if (pages[key].is_redirect) {
    throw new Error(`Key: "${key}" is a redirect`);
  }
  return pages[key].url;
};
