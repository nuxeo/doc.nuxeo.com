'use strict';
/* eslint-env es6 */

// Debugging
const { debug } = require('./debugger')('menu-flatten');

const process_toc_items = (level = 1) => {
  return toc_item => {
    toc_item.show = toc_item.level === 2;
    toc_item.is_toc = true;
    const classes = ['toc-item', `l${level}`, `h${toc_item.level}`];
    toc_item.classes = classes.join(' ');

    return toc_item;
  };
};

const get_pages = (page, toc, level = 1, parents = []) => {
  let menu_items = [];
  const {
    id,
    name,
    url: { full: url_full },
    active,
    children,
    toggled
  } = page;
  const page_classes = parents.map(parent_id => `p${parent_id}`);
  if (active) {
    page_classes.push('active');
  }
  const show = !!toggled;

  const has_control = !!(children && children.length && level > 1);
  if (has_control) {
    page_classes.push('has-control');
  }

  page_classes.push(`l${level}`);

  const page_item = {
    id,
    name,
    url_full,
    active,
    level,
    show,
    parents,
    has_control,
    page_classes
  };

  if (active && toc) {
    page_item.toc_classes = parents.map(parent_id => `p${parent_id}`);
    page_item.toc_classes.push(`l${level}`);
    page_item.toc_classes = page_item.toc_classes.join(' ');
    page_item.toc_items = toc.map(process_toc_items(level));
  }

  menu_items.push(page_item);
  debug('current_page:', menu_items);

  if (children) {
    const new_level = level + 1;
    children
      .map(child => {
        const new_parents = [];
        debug('parents', parents);
        if (parents && parents.length) {
          parents.forEach(parent => new_parents.push(parent));
        }
        new_parents.push(id);
        debug('new_parents', new_parents);

        return get_pages(child, toc, new_level, new_parents);
      })
      .forEach(child => {
        // debug('child', child);
        menu_items = menu_items.concat(child);
      });
  }
  return menu_items;
};

const menu_flatten = (pages, toc) => {
  let all_pages;
  if (pages) {
    all_pages = get_pages(pages, toc);

    // open children and siblings of active page
    const active_page = all_pages.find(page => page.active);
    if (active_page) {
      const { id: active_id, level: active_level, parents: active_parents } = active_page;
      const last_parent = [].concat(active_parents).pop();
      if (active_level > 1) {
        active_page.open = true;
        active_page.page_classes.push('open');
      }

      // open children
      all_pages
        .filter(page => page.parents && page.parents.includes(active_id) && page.level === active_level + 1)
        .forEach(page => {
          page.show = true;
        });

      // open siblings
      all_pages
        .filter(page => page.parents && page.parents.includes(last_parent) && page.level === active_level)
        .forEach(page => {
          page.show = true;
        });

      // set parent open
      if (last_parent) {
        const active_parent = all_pages.find(page => page.id === last_parent);
        if (active_parent && active_parent.page_classes && active_parent.level > 1) {
          active_parent.open = true;
          active_parent.page_classes.push('open');
        }
      }
    }

    // Add classes
    all_pages = all_pages.map(page => {
      if (page.page_classes) {
        page.classes = page.page_classes.join(' ');
        delete page.page_classes;
      }
      return page;
    });
  } else if (toc) {
    all_pages = [
      {
        toc_items: toc.map(process_toc_items())
      }
    ];
  }

  return all_pages;
};

module.exports = menu_flatten;
