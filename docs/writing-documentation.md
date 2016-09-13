# Documentation writing
## Mandatory frontmatter
All `.md` (Markdown) content files should have a YAML frontmatter defined at the top of the file. e.g.

```md
---
layout: default.hbs
title: Title of the page
description: A description for search engines and social media to consume.

---

Content of page goes here.
```

## Optional frontmatter

Frontmatter | Behaviour
--- | ---
`draft: true` | Will show as normal in development but will be removed in production
`hidden: true` | Hidden from the hierarchy menu
`toc: true` | Adds a table of contents derrived from h2..h4  (`## h2` .. `#### h4`) headings
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
