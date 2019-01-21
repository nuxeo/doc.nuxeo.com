module.exports = filepath => {
  const index = 'index.html';
  let newPath = filepath;

  // Add / at start if not present
  if (newPath.slice(0, 1) !== '/') {
    newPath = `/${newPath}`;
  }

  // Remove index from end if present
  if (newPath.slice(0 - index.length) === index) {
    newPath = newPath.slice(0, 0 - index.length);
  }

  return newPath;
};
