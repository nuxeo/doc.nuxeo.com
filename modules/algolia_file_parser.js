// Debugging
// const { error } = require('./debugger')('algolia-file-parser');

const url_mangle = require('./url_mangle');

module.exports = (filename, file) => {
  const documents = [];

  const { title, description = '', excerpt = '', ranking = 3 } = file;
  const version = file && file.url && file.url.key && file.url.key.version;
  const path = url_mangle(filename);

  if (version !== void 0) {
    // add as many as documents as you need
    // documents.push({
    [].push({
      objectID: path,
      title,
      description,
      excerpt,
      version,
      path,
      ranking
    });
  }

  return documents;
};
