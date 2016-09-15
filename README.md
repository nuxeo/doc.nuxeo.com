# doc.nuxeo.com

# Development

## Requirements
- [git](https://git-scm.com/) - make sure your Privacy & Security settings allow to download applications from anywhere
- [SSH key associated with GitHub](https://help.github.com/articles/generating-an-ssh-key/)
- [node.js](https://nodejs.org) &mdash Stable: See [Release schedule](https://github.com/nodejs/LTS#lts_schedule)
- libsass
- Text editor (https://atom.io/ or https://www.sublimetext.com/ for example) set with _soft_ tabs (spaces).

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
## Writing Documentation
[Writing Documentation Guide](./docs/writing-documentation.md#writing-documentation).

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
### `./assets/...`
Any files in this directory will be copied to `./site/assets`. See [`./site/...`](#site)

### `./client/...`
Client side styles (SCSS) and JavaScript.

### `./docs/...`

### `./layout/...`
Templates and partials. See [working with templates](./docs/writing-documentation.md#writing-documentation).

### `./modules/...`
Nuxeo specific modules.

### `./site/...`
Generated output of the site. This is what will be served in production.

### `./test/...`
Unit tests for modules.

### `./verify/...`
Verification tests for post asset and site building.

### `./build.js`
The main build script for generating the output for `site`.

### `./config.yml`
Site configurations, ability to have production or development specific values.

### `./package.json`
Build processes are defined here. Should be relatively self explanatory but anything special will be explained here.

# Trouble shooting
[Trouble shooting guide](./docs/trouble-shooting.md#trouble-shooting)