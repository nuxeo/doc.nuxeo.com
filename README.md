# doc.nuxeo.com

# Development

## Requirements
- [git](https://git-scm.com/) - make sure your Privacy & Security settings allow to download applications from anywhere
- [node.js](https://nodejs.org)
- libsass
- Text editor (https://www.sublimetext.com/ or https://atom.io/ for example)

To install on mac:
- install homebrew (http://brew.sh/) and run ```brew update```

- use brew to install:
```bash
brew install git nodejs libsass
```

## Installation
Clone the repository to your local machine (and remember where it's saved :)), using your favorite git client or the command line:
```bash
git clone https://github.com/nuxeo/doc.nuxeo.com
cd doc.nuxeo.com
npm install
```

## Run Locally
```bash
npm start
```

## Run and host locally
```bash
npm run dev_build
```

### Change browser
The broswer defaults to `chromium-browser` but can be changed with the following command and then locally as usual.
```bash
npm config set Nuxeo-website:browser firefox
```

## Releasing changes
As this module is used via [npm](https://www.npmjs.com/), it's a good practice to bump the version when we make changes.

Node packages follow Semantic Versioning ([SemVer](http://semver.org/)), versions a described by a `MAJOR.MINOR.PATCH` version.

After you've committed your code, run **one** of the following:
```bash
npm version major # incompatible API changes
npm version minor # add functionality in a backwards-compatible manner
npm version patch # backwards-compatible bug fixes
```
Then push the version commit and the tags:
```bash
git push && git push --tags
```

## Project Structure
### `assets`
Any files in this directory will be copied to `site/assets`.

### `client`
Client side styles (SCSS) and JavaScript.

### `layout`
Templates and partials. See [working with templates](./docs/layouts.md).

### `modules`
Nuxeo specific modules.

### `site`
Generated output of the site. This is what will be served in production.

### `test`
Unit tests for modules.

### `verify`
Verification tests for post building.

### `build.js`
The main build script for generating the output for `site`.

### `config.yml`
Site configurations, ability to have production or development specific values.

### `package.json`
Build processes are defined here. Should be relatively self explanatory but anything special will be explained here.

# Trouble shooting
## Invalid front-matter
Error: `Error: Invalid frontmatter in file: {filepath}`

### Solution
Run YAML linter to locate the issue with:

`npm run yaml_lint {filepath}`
