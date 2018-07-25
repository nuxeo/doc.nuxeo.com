const { debug } = require('./debugger')('get-versions');

const sort_by_field = field => {
  return (one, two) => {
    const a = one && one[field];
    const b = two && two[field];

    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };
};

const get_versions = (repositories, repo_id, current_branch_name) => {
  const all_versions = {};
  Object.keys(repositories).forEach(repository_name => {
    const versions = (all_versions[repository_name] = all_versions[repository_name] || []);
    const repository = repositories[repository_name];
    debug('repos', repository);
    Object.keys(repository.branches).forEach(branch_name => {
      const branch = repository.branches[branch_name];
      branch.branch_name = branch_name;
      branch.is_current_version = repository_name === repo_id && branch_name === current_branch_name;

      if (!branch.no_versioning) {
        versions.push(branch);
      }
    });
    all_versions[repository_name] = versions && versions.sort(sort_by_field('order'));
  });

  return all_versions;
};

module.exports = get_versions;
