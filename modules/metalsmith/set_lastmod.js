module.exports = (files, metalsmith, done) => {
  Object.entries(files).forEach(([, file]) => {
    // where present, set the latest history date
    file.lastmod =
      file && file.history && file.history[0] && file.history[0].date;
  });
  done();
};
