# Development
## Requirements
- [Git](https://git-scm.com/) - Make sure your Privacy & Security settings allow to download applications from anywhere
- [Git LFS](https://github.com/github/git-lfs/wiki/Installation)
- [NVM](https://github.com/creationix/nvm/blob/master/README.md#installation)
- [SSH key associated with GitHub](https://help.github.com/articles/generating-an-ssh-key/)
    - Test access with `ssh -T git@github.com` - see [here](https://help.github.com/articles/testing-your-ssh-connection/) for help.
- [node.js](https://github.com/creationix/nvm#install-script) &mdash; Stable: See [Release schedule](https://github.com/nodejs/LTS#lts_schedule)(version >= v6.9)
    - `nvm install 'lts/*'` will get the latest v6 version
    - Test with `node --version`
    - _Remember:_ `nvm use 'lts/*'` at the start of your session
- A Markdown text editor (https://atom.io/ or https://www.sublimetext.com/ for example)
    - [The Atom Documentation plugin](https://github.com/nuxeo/atom-documentation-links#installation)-This plugin provides suggestions for {{file ...}} and {{page ...}} links.
- [EditorConfig plugin](http://editorconfig.org/#download) (Recommended)

### Mac:
- Install homebrew (http://brew.sh/) and run
    
```bash
# Update
brew update
# Install git
brew install git
```

## Installation 

**[master, 710 and 60 branches](https://github.com/nuxeo/doc.nuxeo.com-content)**: For all the versioned documentation (nxdoc/userdoc/admindoc). The versions work with branches, one version = one branch. 

**[Static Branch](https://github.com/nuxeo/doc.nuxeo.com-content/tree/static)**: For non-versioned documentation (studio/idedoc/corg)

Clone the repository to your local machine, using your favorite Git client or the command line:
```bash
git lfs clone git@github.com:nuxeo/doc.nuxeo.com-content.git
cd doc.nuxeo.com-content
git lfs install
git reset --hard
```
#### Run Locally
```bash
npm run dev
```
Once started, http://localhost:3000 opens automatically. Browse to the URL you want to see your changes. 

If you want to skip the initial build and use the existing one as the base, you can do: 

```bash
npm run dev:no-clean
```

Have a look at the [new-page-template.md](new-page-template.md) with your editor or [view the raw source](https://raw.githubusercontent.com/nuxeo/doc.nuxeo.com/master/docs/new-page-template.md).

For more information, have a look at the READMEs of the two repositories. 

# Create a Page
The recommended editor is Atom. It handles markdown nicely and can provide a live preview, fast file finding and image previewing.

**As a lot of people are contributing on the documentation, every creation or edition should go through a Pull Request to be reviewed by the doc team.**

## Editor Configuration

YAML doesn't enjoy having tabs so ensure your editor is configured with _soft_ tabs (spaces).

## Mandatory frontmatter

The documentation uses YAML at the top between two sets of `---`, this section is known as _frontmatter_.
This frontmatter will gather all the information about the page: title, description, review date, historic, tags (formerly known as tags in Confluence), etc. In order to be correctly displayed in the documentation, all `.md` (Markdown) content files should have a YAML frontmatter defined at the top of the file which is:

```md
---
title: Title Of The Page
description: A description for search engines and social media to consume.
review:
    date: '2016-09-14'
    status: ok
    comment: ''
---

Content of page goes here.
```

Frontmatter | Behaviour
--- | ---
`title: Title Of The Page` | The page title
`description: A description...` | This is used for Search Engines and social media to describe the page.
`review: Object` | See [Review section below](#review).

### Review

Review data helps to flag pages that have not been reviewed within the desired period and to mark pages as having issues.

`date` must be in [iso date format `YYYY-MM-DD`](https://en.wikipedia.org/wiki/ISO_8601).

`status` must be **'ok'**, **'not-ok'** or **'requiresUpdates'**

`comment` is optional but should be used to describe what is incorrect with the page if the status is set to **'not-ok'** or **'requiresUpdates'**. Markdown will be converted and multiline text can be added.
_Note_: The comment is displayed on the page.

#### Multiline comment example
```
...
review:
    date: '2016-09-14'
    status: ok
    comment: |-
        I'm a multiline comment
        with **markdown** included

        - list items
        - if necessary
...
```


## Optional frontmatter

Frontmatter | Behaviour
--- | ---
`hidden: true` | Hidden from the hierarchy menu
`toc: true` | Adds a table of contents derived from h2..h4  (`## h2` .. `#### h4`) headings
`tabbed_page: true` | Convert the page to display a tabbed interface. h1 (`# h1`) headings are used as titles of each tab. `{{! end_of_tabs }}` can placed after the last section to allow content to be placed beneath the tabbed section.
`redirect: /redirect/location` | Adds a redirect to the location specified. Accepts a url or `version/space/page name` (`710/nxdoc/installation` / `/nxdoc/installation` / `installation`)
`no_side_menu: true` | Hides the hierarchy menu for that page.
`tree_item_index: 1` | For ordering the left hierarchical menu. Items are ordered by `tree_item_index` and then alphabetically. To ease the maintenance of ordering pages in the left.
`section_parent: section-name` | Sets the section for this page and its children.
`section_override: section-name` | Overrides the hierarchical section.
`previous_link: version/space/page-name` | Adds previous link to the bottom of the page.
`next_link: version/space/page-name` | Adds next link to the bottom of the page.
`notes:>-` | Add a note on the page. 

### Overriding Version Links
This feature allows the version links to point to a different page.

To remove the link for **LTS 2015**:
```yaml
version_override:
    'FT': '.../...'
    'LTS 2015': 710/.../...
    '6.0': 60/.../...
```

Example, to point **LTS 2015** and **6.0** each to a new page:
```yaml
version_override:
    'LTS 2015': 710/nxdoc/installation
    '6.0': 60/nxdoc/installation
```
This accepts the [single attribute form](#single-attribute-form--legacy).

_Note_: the label (e.g. `LTS 2015`) needs to be quoted, this is part of the YAML specification.

## Macros
### Excerpt
```handlebars
{{! excerpt}}
.
.
.
{{! /excerpt}}
```
### Multi-Excerpt
```handlebars
{{! multiexcerpt name='name-of-your-multiexcerpt'}}
.
.
.
{{! /multiexcerpt}}
```
### Panels
Panels should be written like this:
```handlebars
{{#> callout type='info' heading='Info'}}
Content.
{{/callout}}
```
The type can be an info, a warning, a tip or a note.
If you want to create just a basic panel, it should be written like this:  
```handlebars
{{#> panel type='basic' heading='Basic Panel' match_height=true no_markdown=true}} -->
Content.
{{/panel}}
```
### Tabs
If you want to add tabs to your page, you will need to add `tabbed_page: true` in your frontmatter. This will convert all the h1 of your page as title of each tab. </br>
`\{{! end_of_tabs }}` can be placed after the last section to allow content to be placed beneath the tabbed section.

## Links

We recommand you to install the [nuxeo-documentation-links](https://atom.io/packages/nuxeo-documentation-links) addon on Atom to be able to have suggestions while typing links to pages or files. 

### To a Page
Example: for `WebEngine (JAX-RS)`, You can access it by:
`{{page page='webengine-jax-rs'}}`

The page identifier is taken from the name of the file. e.g. `webengine-jax-rs.md` would be accessed by `webengine-jax-rs`.

If the page is in another space you can add a `space` attribute.
If you were in `userdoc` and wanted to access `WebEngine (JAX-RS)` in `nxdoc`.
`{{page space='nxdoc' page='webengine-jax-rs'}}`

Similar if you wish to access a different version add a `version` attribute.
`{{page version='710' space='nxdoc' page='webengine-jax-rs'}}`

#### Single attribute form / Legacy
Single attribute form is also allowed to facilitate the Confluence legacy form.
`{{page page='710/nxdoc/webengine-jax-rs'}}`

To allow for link definitions from Confluence, the following also work.
```
{{page page='WebEngine (JAX-RS)'}}
{{page page='NXDOC:WebEngine (JAX-RS)'}}
{{page page='NXDOC710:WebEngine (JAX-RS)'}}
```
_Tip_: See [links with parenthesis](#links-with-parenthesis-mdash-).

#### Links with parenthesis &mdash; ()
These require us to use the reference style of links:
```md
[Link text][link-reference]
[link-reference]: http://example.com/link(with)parenthesis "Optional title for link"
```

### To an Excerpt
* In the same version:
`{{{excerpt space='space' page='page-name'}}}`
    - Example: `{{{excerpt space='studio' page='studio-overview-and-concepts'}}}`
* In another version: 
`{{{excerpt space='space' version='version' page='page-name'}}}`

### To a Multi-Excerpt
* In the same version:
  ```
  {{{multiexcerpt 'name' page='page-name'}}}
  ```
* In another version:
  ```
  {{{multiexcerpt 'name' version='version' space='space' page='page-name'}}}
  ```

### To Images
Link to images should be written like this:
`![name-of-the-image]({{file version='VERSION' space='SPACE' page='page-name' name='image-name.png'}})`

You can call an image from a different page, space or version. 

An image called `your_img.png` could be referenced by the following:
```md
Basic example:
![Alt text - Required]({{file name='your_img.png'}})
```
All options with file from another space and page:
```
![Alt text - Required]({{file space='nxdoc' page='client-sdks' name='your_img.png'}} ?w=180,h=360,border=true,thumbnail=true,align=right "Title text - Optional")
```

#### Image options

Option | Behaviour
--- | ---
`w=x` | Sets the image width. Replace `x` with the value in pixels. _Note:_ Images greater than 32 will automatically get the thumbnail attribute.
`h=y` | Sets the image height. Replace `y` with the value in pixels.
`border=true` | Gives the image a border.
`thumbnail=true` | Make the image show a larger version upon clicking.
`inline=true` | Allows images to be put side by side.
`align=right` | Positions the image to the right.

### To Download Files
Link to download files should be written like this:
`[Text for download link]({{file space='space' page='page-name' name='file-name.zip'}})`

A file called `your_file.zip` could be referenced by the following:
```md
Basic example:
[Download my file]({{file name='your_file.zip'}})
```

### To Videos
You can link to video from Wistia with the `id` provided:
`{{> wistia_video id='id-of-the-video'}}`

### To Anchors
Anchors to titles will enable you to create links to specific section of a page. By default, every titles have an anchor, for example `## Functional Overview` will create an anchor `functional-overview`. 

The link to call an anchor should be written like this: 
`({{page page='my-page-filename'}}#functional-overview)`

If you want to add an anchor on a specific section, you can add the following:
`{{> anchor 'functional-overview'}}`


## Markdown and Handlebars
The documentation uses standard [GitHub Flavoured Markdown](https://guides.github.com/features/mastering-markdown/), this documentation explains the added feature set using Markdown with [Handlebars](http://handlebarsjs.com/#html-escaping) and some of the helpers and partials we have available.

### Handlebars helpers

Helper | Behaviour
--- | ---
`{{condition foo '===' bar}}` | Allows variable comparisons. Usual usage: `{{#if (condition foo '===' bar)}}...{{/if}}`
`{{page ...}}` | See [Page Links](#to-a-page)
`{{file ...}}` | See [Links to Images](#to-images) and/or [Links to Downloading Files](#to-download-files)
`{{file_content url='url'}}` | Retrieves content from an external url. Usual usage `{{{md (file_content url='https://example.com/url-to-raw-markdown-file.md')}}}`
`{{md foo}}` | Converts a variable from Markdown.
`{{moment foo format='D MMM YYYY'}}` | [Formats a date](http://momentjs.com/docs/#/displaying/format/) variable using moment. Alternative usage: `{{moment foo fromNow=''}}` displays a period from now. e.g. '3 days ago'
`{{sluggy foo}}` | Converts a variable to a url slug. e.g. 'Title Of Page' > 'title-of-page'
`{{table_from_details ...}}` | See [Table from details (filter-table)](#table-from-details-filter-table)


### Handlebars Partials

Partial | Behaviour
--- | ---
`{{#> accordian heading='title' closed=true}}Content{{/accordian}}` | Adds an accordian element that is closed by default. `closed` is optional
`{{> anchor 'anchor-id'}}` | Adds an anchor into the content. _Note_: Anchors are added to every heading by default. e.g. `## Functional Overview` will create an anchor `functional-overview`
`{{#> callout type='info' no_icon=true heading='Title'}}Content{{/callout}}` | Callouts display a warning or information block for the user. `type` can be: 'tip', 'success',  'hint', 'info', 'warning' or 'note'.  `heading` and `no_icon` are optional
`{{> children}}` | Display an _unordered_ list of the children from the current page
`{{> panel type='info' heading='Title' match_height=true no_markdown=true}}Content{{/panel}}` | Similar to the callout partial, creates a bordered section. `type` is optional and can be 'primary', 'secondary', 'success', 'warning', 'alert'. `match_height` and `no_markdown` are optional
`{{> wistia_video id='9pfro1cpv1'}}` | Inserts a Wistia Video using the `id` provided


### Table from details (filter-table)
`details` can be put into a table for display

#### Basic Example (without filtering)

The following definition will display `howto` details from `nxdoc` and `studio` spaces and include these fields: `Excerpt`, `Topics` and `Level`.

By default the table will include `Title` with a link to that page.
```
{{{table_from_details label='howto' spaces='nxdoc, studio' heading='Excerpt, Topics, Level'}}}
```

#### Filtering Tables

Expanding from the previous example, this will limit to only `Advanced` pages with `translate` in the excerpt field. Sorted by `topics`
```
{{{table_from_details label='howto' spaces='nxdoc, studio' heading='Excerpt, Topics, Level' filter='level=advanced, excerpt=translate' sort_by='topics'}}}
```

#### Options

Option | Behaviour
--- | ---
`headings='Fields, Separated By Comma'` | The fields aren't case sensitive but need to match the field within `details` frontmatter.
`label='name_of_label'` | The label of the data from within `details`.
`spaces='nxdoc, admindoc'` | These are which spaces to get the information from. Can be space separated if desired. For versions these should be in the form `{version}/{space}` e.g. `710/nxdoc, 60/nxdoc`
`sort_by='field'` | Field to sort the table results by.
`filter='field_name=search_text, another_field=search_text'` | Filter the table by fields with text values. Case-insensitive.
`filter_type='and'` | If mulitiple fields are being filtered upon, `and` will mean all fields have to have a match for the row to be present in the table. Defaults to `or` if omitted.
## Spelling 

You'll find on [this page](https://doc.nuxeo.com/corg/user-interface-guidelines/) basic spelling guidelines to write documentation. 

## Formatting 

### Titles 

- **Levels** 

Start your page with a h2 title as the h1 is the global page title, and then subsections with h3, h4, etc.

- **Capitalization** 
Capitalize headings (page titles and titles in the page). Some rules are listed on the English Grammar and Typography (US) - Common Mistakes note on the intranet, but you can use the website http://titlecapitalization.com/ to check how titles are capitalized (please use "Chicago Manual of Style" option which used to be the only option and so all titles have been capitalized using this rule until they introduced other options). Don't put a final dot at the end.

- **HOWTO Titles**
The titles of "how to" pages must start with "HOWTO:". For example:
`HOWTO: Customize the Login Page`
This is better for SEO and it makes it clear what the page is (from search results typically).

### Buttons, Parameters Formatting

Use **bold font** for buttons, menus, icons, tabs names.
For instance: Click on the **Save** button.
Use `monospaced text` for file, properties, class, path names, etc.
For instance:
- Download the updated JAR, called `nuxeo-launcher-5.4.2-HF09-jar-with-dependencies.jar`.
- If you open the `MyRoot` class, you will notice that there is a regular JAX-RS root resource with some WebEngine annotations.
- By default, `data` and `log` directories are stored inside the Nuxeo tree.
- Linux recommended path: `/var/log/nuxeo/...`

### Procedures / Steps 

Use numbered bullets for procedures, not bulleted points.
Add an introductory sentence in bold that describes what the steps are about.
Use imperative (do this, do that) instead of "you can do this".
Don't forget the period at the end your sentence.
For instance:
> **To move the data and log directories:**
>1. In the Admin Center, type the path to the location where you want the directories to be stored (see the table below).
>2. Click on **Save**.
>3. Restart your server.

### Punctuation

- Do not use **double spaces between sentences**. Double spacing after a period is a very old typewriter and fixed-width-fonts habit that has absolutely no relevance now in an era of proportional fonts with fine-tuned kerning.

- **Do not use a single dash (-) or two dashes (--)** for pause or separation in a sentence. For instance do not write "Nuxeo EP - Overview" or "Nuxeo EP -- Overview" but use the proper em-dash character (—) (&#x2014; in wiki mode). Learn how to type it on your keyboard (on English Mac OS X keyboards it's Shift-Alt-Dash).

- **Use a non-breaking space between value and unit** to avoid them being split by word wrapping. For example, write 2&nbsp;GB for 2 GB.

- **Don't put spaces before double punctuation signs** (: ; ! ?) in English. However, note that in French these signs require a non-breaking space before them.

- **Don't put ellipses after "etc."** and put a comma before (see http://en.wikipedia.org/wiki/Etcetera).
Write "[...] documents, metadata, document query language (NXQL), versioning, audit, etc." and not "[...] documents, metadata, document query language (NXQL), versioning, audit, etc ...".

### Bulleted and Numbered Lists

Use colon to introduce the list.
If the list is an enumeration of items, examples, capitalize the first word of each list item and don't put a period or comma at the end.
For instance:
> A blobProvider is a component that provides an API to read and write binary streams as well as additional services such as:
> Getting associated thumbnail of a binary stream
> Getting a download URI
> Some version management features
> Getting available conversions
> Getting registered applications links


# Edit a Page
## Review a Page

As a lot of people are contributing on the documentation, **every creation or edition should go through a Pull Request** to be reviewed by the doc team.

Once you have reviewed a page, you will need to update its status accordingly. This status is displayed in the frontmatter on the page itself. To do so:

- **If the content is still relevant**, change review date to current date and make sure status is “ok”. At the same time, in the frontmatter change the label `content-review-lts2016`to => `lts2016-ok` 

- **If you see that the page requires small updates**, please edit and update the page directly as you read it. Change review date to current date and make sure status is “ok”. It will take less time to everyone that to read it again and update it later. At the same time, in the frontmatter change the label `content-review-lts2016`to => `lts2016-ok` 

- **If the topic is still relevant but content needs to be deeply updated**, change review date current date, change status to “not-ok” or “requiresUpdates” and add a comment explaining what’s wrong. 
Note: The comment will displayed on the page, so make sure that it is well written as it is displayed at the top of the page to inform the viewer what is the problem on the page. 
Then, create a JIRA ticket and start processing it once you are done with all of your assigned pages. 
Once it's done change the review date to current date and make sure status is “ok” and change the label in the frontmatter `content-review-lts2016`to => `lts2016-ok`. 

A multiline comment is possible, it should look like this:

```
---
review:
  date: 'yyyy-mm-dd'
  status: ok|not-ok|requiresUpdates
  comment: |-
      I'm a multiline comment
      with **markdown** included

      - list items
      - if necessary
---
```

- **If page is clearly obsolete and should not be available anymore**, create a JIRA ticket with the name of the page(s) to delete and tag it nxDocTeam and nxProduct.

**Tips to Edit a Page**
- Do not edit the Confluence section in the frontmatter. 
- Do not edit the History section in the frontmatter.
- If you need to update an image, you need to do it via the command line but do not do it via the GitHub User Interface. Assets need to go through Git LFS to be added properly to the documentation. 


## Global optional frontmatter
### `style`
Define a page specific style sheet. Defined in `doc.nuxeo.com/client/scss/`. e.g. To use `doc.nuxeo.com/client/scss/home.scss`, the front-matter would be:
```md
---
...
style: home
...
---
Page content here.
```
### `script`
Define a page specific JavaScript. Defined in `doc.nuxeo.com/client/js/`. e.g. To use `doc.nuxeo.com/client/scss/home.js`, the front-matter would be:
```md
---
...
script: home
...
---
Page content here.
```

For new JS, add an entry to `doc.nuxeo.com/webpack.config.js`. See `main.js` as an example.


# Trouble shooting
[Trouble shooting guide](./trouble-shooting.md#trouble-shooting)

# Licenses

Code is licensed under a [GNU GPLv3](LICENSE.txt) and content </a><br />is under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" />
