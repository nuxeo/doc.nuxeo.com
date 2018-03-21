const http_reg = /^https?:\/\/github\.com\//;
const ssh_reg = /^git@github\.com:/;
const git_suffix_reg = /\.git$/;

module.exports = url => {
  if (typeof url !== 'string') {
    return '';
  }

  return url
    .replace(http_reg, '')
    .replace(ssh_reg, '')
    .replace(git_suffix_reg, '');
};
