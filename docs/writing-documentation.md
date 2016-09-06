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
`redirect: /redirect/location` | Adds a redirect to the location specified. Accepts a url or `version/space/page name` (`70/nxdoc/installation` / `nxdoc/installation` / `installation`)
`redirect_source: /redirect/location` | Adds a redirect to the location specified using the confluence style `NXDOC70:Page Title`
`no_side_menu: true` | Hides the hierarchy menu for that page
`slug: new-slug-for-page` | Overrides the slug that would be created from the page `title`.
`version_override:` | For overriding / turning off version links for a specific version. See the next item below as an example.
`LTS: none` | `version_override:` Addressed by the version label, the link will override the calculated link to that version based upon the current page. Links can take the form of `http...`, `70/nxdoc/installation` [see Single attribute form](#single-attribute-form-legacy) and `none` which will remove the link entirely.
`tree_item_index: 1` | For ordering the left hirarchical menu. Items are ordered by `tree_item_index` and then alphabetically. For ease of maintaining ordering, using

## Markdown and Handlebars
The documentation uses standard [GitHub Flavoured Markdown](https://guides.github.com/features/mastering-markdown/), this documentation explains the added features of using Markdown with Handlebars and some of the helpers and partials we have available.

### Page links
For `WebEngine (JAX-RS)`, You can would access it by:
`{{page page='webengine-jax-rs'}}`

If the page is in another space you can add a `space` attribute.
If you were in `userdoc` and wanted to access `WebEngine (JAX-RS)` in `nxdoc`.
`{{page space='nxdoc' page='webengine-jax-rs'}}`

Simplar if you wish to access a different version add a `version` attribute.
`{{page version='70' space='nxdoc' page='webengine-jax-rs'}}`

#### Single attribute form / Legacy
Single attribute form is also allowed to facilitate the Confluence legacy form.
`{{page page='70/nxdoc/webengine-jax-rs'}}`

To allow for link definitions from Confluence, the following also work.
```
{{page page='WebEngine (JAX-RS)'}}
{{page page='NXDOC:WebEngine (JAX-RS)'}}
{{page page='NXDOC70:WebEngine (JAX-RS)'}}
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
`{{file version='70' space='nxdoc' page='webengine-jax-rs' name='name-of-file.png'}}`

Again legacy interperatation is also allowed for.

### Excerpts Definition
Excerpts are to reuse content within the same page. In contrast Multi-excerpts can be reused in any page.

```handlebars
{{! excerpt name="foo"}}
Reuse the text **foo** in this page only.
{{! /excerpt}}
```
or
```handlebars
{{! multiexcerpt name="bar"}}
Reuse the text **bar** in any page.
{{! /multiexcerpt}}
```

### Excerpts Use
```handlebars
{{excerpt 'foo'}}
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