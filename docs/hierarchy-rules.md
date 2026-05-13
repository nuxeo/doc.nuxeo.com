# Content Hierarchy Rules for Technical Writers

This document explains the structural rules that the build system enforces when
processing documentation files. Violating these rules causes build errors such as
**"Missing parents for file"** or **"Missing hierarchy item for file"**. Follow
these guidelines every time you create or move files in a PR.

---

## 1. Every file must live inside a recognised space folder

The first directory segment of any `.md` or `.html` file path is treated as the
**space** (e.g. `client-apps`, `nxdoc`, `studio`).  
Each space must be declared in the site configuration (`config.yml`).  If you
place a file in a folder that is not a configured space, the file is silently
dropped from the hierarchy and pages that reference it will fail.

```
✅  src/client-apps/nuxeo-drive/nuxeo-drive-release-notes/6.0.1-nuxeo-drive-release-notes.md
❌  src/client-apps/nuxeo-drive/nuxeo-drive-release-notes/src/client-apps/…/6.0.1-nuxeo-drive-release-notes.md
```

---

## 2. The `index.md` file marks the root of each section

Every folder that contains content pages **must** have an `index.md` file in it.
This file is the **space index** (`is_space_index = true`) and becomes the parent
node in the hierarchy tree.

- Do **not** rename `index.md` to anything else.
- Do **not** delete `index.md` from a folder that still contains other pages.
- The `index.md` title becomes the navigation label for that section.

---

## 3. Parent folders must exist before child files

The build walks the directory path of every file and looks up each path segment
as a child node in the already-built hierarchy tree.  If any segment is missing
the build **fails immediately** with:

```
Error: Missing parents for file: <path>
```

**Practical rule:** Before adding a new file at any path depth, ensure that every
ancestor folder already has a corresponding `index.md` (or is itself a
registered space root).  In a single PR you may add both the `index.md` and child
pages, but the `index.md` must be present.

---

## 4. Never place content inside a duplicate path

A common mistake when creating a PR from a branch that was checked out inside the
content repository is accidentally nesting the full `src/…` tree inside an
existing content directory.  For example, if you create files while your working
directory is already inside `nuxeo-drive-release-notes/`, the committed path
becomes:

```
nuxeo-drive-release-notes/src/client-apps/nuxeo-drive/nuxeo-drive-release-notes/6.0.1-…
```

This doubles the path and creates a dangling subtree with no valid parent.
**Always verify the root of your file paths before committing.**

---

## 5. File paths must use the correct top-level `src/` prefix — exactly once

All content files live under `src/`.  The build strips the leading `src/` segment
internally, so the effective path starts with the space name.

- Only one `src/` prefix is allowed.
- Do **not** commit files whose paths contain `src/…/src/…`.

---

## 6. `tree_item_index` controls the sort order within a section

Each page's front-matter may include a `tree_item_index` integer.  The hierarchy
is sorted by:

1. Pages **without** a `tree_item_index` (they go last).
2. `tree_item_index` ascending (lower numbers appear first in the menu).
3. `slug` alphabetically as a tie-breaker.

**Rules:**
- Assign unique, non-zero integers to pages you want to appear in a specific
  position.
- Lower numbers appear **higher** in the navigation.
- Pages without a `tree_item_index` are placed **after** all numbered pages.
- Avoid duplicate index values within the same folder; if two pages share the
  same value, they are further sorted alphabetically by slug.

---

## 7. Hidden pages are excluded from navigation but still require valid parents

If a page has `hidden: true` in its front-matter it is excluded from the left-nav
tree, but it must still reside in a structurally valid location. The build still
traverses its path to verify parent existence.

---

## 8. `section_parent` must reference a real slug

Folders (index pages) declare a `section_parent` to indicate which top-level
section they belong to.  This value is propagated to child pages to drive the
active navigation state.

- The value must match the `slug` of an existing page higher in the tree.
- Leaving it blank is allowed for the top-level space index only.

---

## Quick pre-PR checklist

Before opening a pull request, verify the following:

- [ ] Every new folder contains an `index.md`.
- [ ] The file path starts with `src/<space>/` and **does not repeat** `src/` or
      the space name partway through the path.
- [ ] No `src/…/src/…` nesting exists anywhere in the changed files.
- [ ] `tree_item_index` values within the same folder are unique non-zero
      integers (or intentionally omitted to sort last).
- [ ] Any `section_parent` value refers to a slug that already exists in the
      hierarchy.
- [ ] Hidden pages still live in a valid directory with an `index.md` parent.

---

## Error reference

| Build error message | Most likely cause |
|---|---|
| `Missing parents for file: <path>` | A directory segment in the file path has no matching `index.md` node, or the path is incorrectly nested (Rule 3 / Rule 4). |
| `Missing hierarchy item for file: <path>` | A visible, non-hidden page could not be found in the hierarchy tree built from `hierarchies.js` — usually because the `index.md` for its parent folder is missing (Rule 2). |
| `Can't find '<space>' in …` | The space folder name does not match any entry in the site configuration (Rule 1). |
| `Duplicate key found: "<key>"` | Two files resolve to the same URL key; rename or relocate one of them. |
