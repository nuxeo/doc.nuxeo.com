const Entities = require('html-entities').AllHtmlEntities;
const slug = require('slugify');
const entities = new Entities();

module.exports = string => slug(entities.decode(string), { lower: true, remove: /[$*+~.()'"!;:@/]/g });
