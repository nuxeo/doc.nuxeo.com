const slug = require('slugify');

module.exports = string => slug(string, { lower: true, remove: /[$*+~.()'"!:@]/g });
