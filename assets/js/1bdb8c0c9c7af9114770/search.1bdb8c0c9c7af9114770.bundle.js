webpackJsonp([1],{678:function(e,exports,t){"use strict";(function($){var e=t(116),a=function(e){return e&&e.__esModule?e:{default:e}}(e),i=t(193);$(document).ready(function(){var e=$("#algolia_search_config"),t=e.attr("data-search-key"),s=e.attr("data-id"),n=(0,a.default)({appId:s,apiKey:t,indexName:"doc",routing:!0});n.addWidget((0,i.configure)({facetFilters:["version:latest"]})),n.addWidget((0,i.searchBox)({container:"#search-input",placeholder:"Search Nuxeo Docs",autofocus:!0})),n.addWidget((0,i.hits)({container:"#hits",cssClasses:{item:"row paddedt0"},templates:{empty:"No results",item:'<div class="columns small-12 medium-8"><a href="{{{url}}}"><strong>{{{_highlightResult.title.value}}}</strong><br>{{{_highlightResult.description.value}}}</a></div><div class="columns show-for-medium medium-4"></div>'}})),n.start();var o=$("#hits");$("#search-input").on("change keyup","input",function(){$(this).val()?o.show():o.hide()}),n.on("render",function(){$("#search-input input").change()})})}).call(exports,t(10))}},[678]);