module.exports = (filepath) => {
  const index = '/index';
  let newPath = filepath;

  // Add / at start if not present
  if (newPath.slice(0, 1) !== '/') {
    newPath = `/${newPath}`;
  }

  // Remove index from end if present
  if (newPath.slice(0 - index.length) === index) {
    newPath = newPath.slice(0, 0 - index.length);
  }

  // Add / at end if not present
  if (newPath.slice(-1) !== '/' && newPath.length > 1) {
    newPath = `${newPath}/`;
  }

  return newPath;
};
