'use strict';
/* eslint-env browser */
/* global $ */

import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, hits, searchBox } from 'instantsearch.js/es/widgets';

$(document).ready(function() {
  const $algolia_config = $('#algolia_search_config');

  const search_key = $algolia_config.attr('data-search-key');
  const id = $algolia_config.attr('data-id');
  // const search_version = $algolia_config.attr('data-search-version');
  // const search_space_path = $algolia_config.attr('data-search-space-path');

  const search = instantsearch({
    indexName: 'doc',
    searchClient: algoliasearch(id, search_key),
    routing: true
  });

  search.addWidget(configure({ facetFilters: ['version:latest'] }));

  search.addWidget(
    searchBox({
      container: '#search-input',
      placeholder: 'Search Nuxeo Docs',
      autofocus: true
    })
  );

  search.addWidget(
    hits({
      container: '#hits',
      cssClasses: {
        item: 'row paddedt0'
      },
      templates: {
        empty: 'No results',
        item:
          '<div class="columns small-12 medium-8"><a href="{{{url}}}"><strong>{{{_highlightResult.title.value}}}</strong><br>{{{_highlightResult.description.value}}}</a></div><div class="columns show-for-medium medium-4"></div>'
      }
    })
  );

  search.start();

  const $hits = $('#hits');

  $('#search-input').on('change keyup', 'input', function() {
    const $this = $(this);
    if ($this.val()) {
      $hits.show();
    } else {
      $hits.hide();
    }
  });

  search.on('render', function() {
    $('#search-input input').change();
  });
});
