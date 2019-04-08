/* eslint-env browser, jquery */
import instantsearch from 'instantsearch.js';
import { configure, hits, searchBox } from 'instantsearch.js/es/widgets';

let initialised = false;
const $main_menu = $('#nuxeo-satellite-header');
const $algolia_config = $('#algolia_search_config');

const search_key = $algolia_config.attr('data-search-key');
const id = $algolia_config.attr('data-id');
const search_version = $algolia_config.attr('data-search-version');
const search_space_path = $algolia_config.attr('data-search-space-path');
const search_space = $algolia_config.attr('data-search-space');

// console.log('search_version', search_version);
// console.log('search_space_path', search_space_path);
// console.log('search_space', search_space);

const $search_box = $main_menu.find('#search-box');
const $hits = $('#algolia_search_results');

const close_search = () => {
  $(document).off('click focus', close_handler);
  $search_box.removeClass('active');
  $hits.hide();
};

const close_handler = e => {
  const $target = $(e.target);
  if (
    $search_box.hasClass('active') &&
    !$target.closest('#menu-search-icon').length &&
    !$target.closest('#search-box').length
  ) {
    close_search();
  }
};

const show_results = () => {
  const search_string = $('#menu-search-input input').val();

  if (search_string.length) {
    $hits.show();
  } else {
    $hits.hide();
  }
};

$('#menu-search-input').on('change keyup', 'input', function(e) {
  const $this = $(this);

  if (e.type === 'keyup' && e.which === 27) {
    // Escape key
    $this.val('');
    close_search();
  } else {
    show_results();
  }
});

const initialise_search = () => {
  if (!initialised && search_key && id) {
    const menu_search = instantsearch({
      appId: id,
      apiKey: search_key,
      indexName: 'doc',
      routing: false
    });

    const filters =
      search_version !== 'latest' && search_space_path
        ? `space_path:${search_space_path} OR version:latest AND NOT space_path:${search_space}`
        : 'version:latest';

    menu_search.addWidget(
      configure({
        filters
      })
    );

    // space_path:910/nxdoc OR version:latest AND NOT space_path:nxdoc"

    menu_search.addWidget(
      searchBox({
        container: '#menu-search-input',
        placeholder: 'Search Nuxeo Docs',
        autofocus: true
      })
    );

    menu_search.addWidget(
      hits({
        container: '#menu-hits',
        cssClasses: {
          item: 'row paddedt0'
        },
        templates: {
          empty: 'No results',
          item:
            '<div><a href="{{{url}}}"><strong>{{{_highlightResult.title.value}}}</strong><br>{{{_snippetResult.description.value}}}</a></div>'
        }
      })
    );

    menu_search.start();

    menu_search.on('render', function() {
      $('#menu-search-input input').change();
    });

    $search_box.on('click', '.ais-search-box--reset', function() {
      $main_menu.find('#search-box input').select();
    });

    $('#menu-search-input input').attr('name', 'query');

    initialised = true;
  } else {
    // eslint-disable-next-line no-console
    console.log('Alogia could not initialise');
  }
};

$main_menu.on('click', '#menu-search-icon', () => {
  if (!initialised) {
    initialise_search();
  }

  $search_box.addClass('active');
  show_results();
  $main_menu.find('#search-box input').select();

  // Listen for events to close
  $(document).on('click focus', close_handler);
});

// setTimeout(() => initialise_search(), 100);
