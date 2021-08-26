const head_description = (options) => {
  const file = options.data.root;
  const title = options.hash.title || file.title;
  const description = (options.hash.description || file.description || '')
    .toString()
    .trim();

  return description
    ? description
    : `${title}. Learn how to get started with Nuxeo documentation.`;
};

module.exports = head_description;
