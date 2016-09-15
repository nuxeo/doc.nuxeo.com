# Trouble shooting

## Invalid front-matter
Error: `Error: Invalid frontmatter in file: {filepath}`

### Solution
Run YAML linter to locate the issue with:

`npm run yaml_lint {filepath}`

## Handlebars - Incorrect closing tag
```
nuxeo-build:error Error: File: nxdoc/example-filename.html - Error: Parse error on line 84:
...</li></ul><p>{{#> /callout}}</p><h1 i
---------------------^
```

### Solution
Closing tag should be `{{/callout}}`