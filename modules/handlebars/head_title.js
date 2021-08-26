const head_title = (options) => {
  const file = options.data.root;
  const title = options.hash.title || file.title;

  return title ? `${title} | ${file.site.name}` : file.site.name;
};

module.exports = head_title;
