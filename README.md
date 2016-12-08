# doc.nuxeo.com

# Development

## Requirements
- [Git](https://git-scm.com/) - make sure your Privacy & Security settings allow to download applications from anywhere
- [Git LFS](https://github.com/github/git-lfs/wiki/Installation)
- [SSH key associated with GitHub](https://help.github.com/articles/generating-an-ssh-key/)
- [Node.js](https://github.com/creationix/nvm#install-script) &mdash; Stable: See [Release schedule](https://github.com/nodejs/LTS#lts_schedule)(version >= v6.9)
    - `nvm install v6` will get the latest v6 version
    - Test with `node --version`
    - _Remember:_ `nvm use v6` at the start of your session
- [libsass](http://sass-lang.com/libsass)
- A Markdown text editor (https://atom.io/ or https://www.sublimetext.com/ for example)
- [EditorConfig plugin](http://editorconfig.org/#download).

### Mac:
- Install homebrew (http://brew.sh/) and run
    ```bash
# Update
brew update
# Install git and libsass
brew install git libsass
```

## Installation
Clone the repository to your local machine, using your favorite Git client or the command line:
```bash
git clone https://github.com/nuxeo/doc.nuxeo.com
cd doc.nuxeo.com
npm install
```

## Build locally
```bash
npm start
```

## Host locally after build
```bash
npm run server
```

## Run and host locally (watches changes)
```bash
npm run dev_server
```

## Run re-compile for assets and host (watches changes)
Run a complete build so all pages are built.
```bash
npm start
```
To speed up the build you can comment out versions in `config.yml` with `#`. e.g.
```
    repositories:
        platform:
            url: git@github.com:nuxeo/doc.nuxeo.com-content.git
            branches:
                - static
                - master
                # - '710'
                # - '60'
                # - '58'
```
`710`, `,60` and `58` have been commented out so only the static content and FT platform spaces are built.

Then run the following to host and watch for client asset changes
```bash
npm run dev_assets
```

### Change browser
The browser defaults to `chromium-browser` but can be changed with the following command and then locally as usual.
```bash
npm config set Nuxeo-documentation-content:browser firefox
```
## Writing Documentation
[Writing Documentation Guide](./docs/writing-documentation.md#writing-documentation).

## Releasing changes
As this module is used via [npm](https://www.npmjs.com/), it's a good practice to bump the version when we make changes.

Node packages follow Semantic Versioning ([SemVer](http://semver.org/)), versions a described by a `MAJOR.MINOR.PATCH` version.

Recompile the client assets
```bash
npm run compile
git add assets lib
git commit -m 'Client Assets: Recompiled'
```

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

# Licenses

Code is licensed under a [GNU GPLv3](LICENSE.txt) and content </a><br />is under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" />
