# Documentation writing

The documentation uses YAML at the top between two sets of `---`, this section is known as _frontmatter_.

Have a look at the [new-page-template.md](new-page-template.md) with your editor or [view the raw source](https://raw.githubusercontent.com/nuxeo/doc.nuxeo.com/master/docs/new-page-template.md).

## Editor Configuration

YAML doesn't enjoy having tabs so ensure your editor is configured with _soft_ tabs (spaces).

The recommended editor is [Atom](https://atom.io/) as it handles markdown nicely and can provide a live preview (cmd + shift + m), fast file finding (cmd + p) plus many more features.

## Mandatory frontmatter
All `.md` (Markdown) content files should have a YAML frontmatter defined at the top of the file. e.g.

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
`title: Title Of The Page` | The title of the page is automatically converted to a URL. In this case the outcome would be `title-of-the-page`. Override this by using the optional paramater `slug`.
`description: A description...` | This is used for Search Engines and social media to describe the page.
`review: Object` | See [Review section below](#review).

### Review

Review data helps flag pages that have not been review within the desired period and to mark pages as having issues.

`date` must be in [iso date format `YYYY-MM-DD`](https://en.wikipedia.org/wiki/ISO_8601).

`status` must be **'ok'**, **'not-ok'** or **'requiresUpdates'**

`comment` is optional but should be used to describe what is incorrect with the page if the status is set to **'not-ok'** or **'requiresUpdates'**. Markdown will be converted and multiline text can be added. _Note_: This is displayed on the page.

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
`slug: new-page-url` | To override the automatic conversion of the page title to a link
`draft: true` | _Not implemented_ &mdash; control of draft pages will be achieved by using branches
`excerpt: About the page` | Similar to the `description` and an alternative to putting [Excerpts within the page content](#excerpts-definition). If both are present the frontmatter will be taken in preference.
`hidden: true` | Hidden from the hierarchy menu
`toc: true` | Adds a table of contents derrived from h2..h4  (`## h2` .. `#### h4`) headings
`tabbed_page: true` | Convert the page to display a tabbed interface. h1 (`# h1`) headings are used as titles of each tab. `{{! end_of_tabs }}` can placed after the last section to allow content to be placed beneath the tabbed section.
`redirect: /redirect/location` | Adds a redirect to the location specified. Accepts a url or `version/space/page name` (`710/nxdoc/installation` / `nxdoc/installation` / `installation`)
`redirect_source: /redirect/location` | Adds a redirect to the location specified using the confluence style `NXDOC710:Page Title`
`no_side_menu: true` | Hides the hierarchy menu for that page
`slug: new-slug-for-page` | Overrides the slug that would be created from the page `title`.
`version_override:` | For overriding / turning off version links for a specific version. See [version override section](#overriding-version-links).
`tree_item_index: 1` | For ordering the left hirarchical menu. Items are ordered by `tree_item_index` and then alphabetically. For ease of maintaining ordering, using

### Overriding Version Links
This feature allows the version links to point to a differnt page.

To remove the link for **LTS 2015**:
```yaml
version_override:
    'LTS 2015': none
```

To point **LTS 2015** and **6.0** each to a new page:
```yaml
version_override:
    'LTS 2015': 710/nxdoc/installation
    '6.0': 60/nxdoc/installation
```
This accepts the [single attribute form](#single-attribute-form--legacy).

_Note_: the label (e.g. `LTS 2015`) needs to be quoted, this is part of the YAML specification.

## Markdown and Handlebars
The documentation uses standard [GitHub Flavoured Markdown](https://guides.github.com/features/mastering-markdown/), this documentation explains the added features of using Markdown with Handlebars and some of the helpers and partials we have available.

### Handlebars helpers

Helper | Behaviour
--- | ---
`{{condition foo '===' bar}}` | Allows variable comparisons. Usual usage: `{{#if (condition foo '===' bar)}}...{{/if}}`
`{{page ...}}` | See [Page Links](#page-links)
`{{file ...}}` | See [File asset linking](#file-asset-linking)
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


### Page links
For `WebEngine (JAX-RS)`, You can would access it by:
`{{page page='webengine-jax-rs'}}`

If the page is in another space you can add a `space` attribute.
If you were in `userdoc` and wanted to access `WebEngine (JAX-RS)` in `nxdoc`.
`{{page space='nxdoc' page='webengine-jax-rs'}}`

Simplar if you wish to access a different version add a `version` attribute.
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


### File asset linking
Very similar to the rules of [Page Links](#page-links). To access a file attached to the current page:
`{{file name='name-of-file.png'}}`

From a different page, you can use `page`, `space` and `version` as with [Page Links](#page-links).
`{{file version='710' space='nxdoc' page='webengine-jax-rs' name='name-of-file.png'}}`

Again legacy interperatation is also allowed for.

### Excerpts Definition
Excerpts are to reuse content within the same page. In contrast Multi-excerpts can be reused in any page.

```handlebars
{{! excerpt}}
Reuse the text **foo** in other pages.
{{! /excerpt}}
```
or
```handlebars
{{! multiexcerpt name="bar"}}
Reuse the text **bar** in any page by the `name` reference.
{{! /multiexcerpt}}
```

### Excerpts Use
```handlebars
{{excerpt 'page-name'}}
```
or
```handlebars
{{multiexcerpt 'bar'}}
```

### Images
An image called `your_img.png` could be referenced by the following:
```md
Basic example:
![Alt text - Required]({{file name='AdapterService.png'}})

All options with file from another space and page:
![Alt text - Required]({{file space='nxdoc' page='client-sdks' name='AdapterService.png'}} ?w=180,h=360,border=true,thumbnail=true,align=right "Title text - Optional")
```

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
`spaces='nxdoc, admindoc'` | These are which spaces to get the information from. Can be space separated if desired.
`sort_by='field'` | Field to sort the table results by.
`filter='field_name=search_text, another_field=search_text'` | Filter the table by fields with text values. Case-insensitive.
`filter_type='and'` | If mulitiple fields are being filtered upon, `and` will mean all fields have to have a match for the row to be present in the table. Defaults to `or` if omitted.


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

## Errors/Troubleshooting

### Handlebars - Incorrect closing tag
```
nuxeo-build:error Error: File: nxdoc/example-filename.html - Error: Parse error on line 84:
...</li></ul><p>{{#> /callout}}</p><h1 i
---------------------^
```

Closing tag should be `{{/callout}}`