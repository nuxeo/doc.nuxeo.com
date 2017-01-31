'use strict';

/**
 * Returns boolean true if node.name matches the filter text
 *
 * @param   {Object} node    Object containing name to match
 * @param   {String} filter  String to match
 *
 * @returns {boolean}
 */
var matchers = {
    filter: function (node, filter) {
        return node.name.toLowerCase().indexOf(filter) !== -1;
    },
    direct_only: function (node) {
        if ((node.active || node.active_child) && node.children) {
            node.children = node.children.map(function (child) {
                child.active_child = true;
                return child;
            });
        }
        return node.active || node.active_child;
    }
};


/**
 * Filters a tree keeping parents of matched items. Also expands parents so they are visible.
 *
 * @param  {Object} node    Tree to look for matches within
 * @param  {String} filter  String to search for
 *
 * @returns {Object}        Tree with matches or undefined
 */
var filter_items = function (node, filter_type, filter) {
    var children = void 0;
    if (node.children) {
        node.children.forEach(function (child) {
            var keep_child = filter_items(child, filter_type, filter);
            if (keep_child) {
                children = children || [];
                children.push(keep_child);
            }
        });
    }

    return (children || matchers[filter_type](node, filter)) ? Object.assign({}, node, { children: children }, { toggled: true }) : void 0;
};


/**
 * Filters a tree keeping parents of matched items. Root element returned only if no matches.
 *
 * @param   {Object} data    Tree data
 * @param   {String} filter  String to search for
 *
 * @returns {Object}
 */
var get_filtered_tree = function (data, filter_type, filter) {
    var filtered;

    if (filter_type === 'direct_only') {
        // console.log('menu', data);
        filtered = filter_items(data, filter_type);
    }
    // Only process if filter is 2 or more chars
    else if (filter_type === 'filter' && filter && filter.length >= 2) {
        filter = filter.toLowerCase();
        filtered = filter_items(data, filter_type, filter);
    }
    if (!filtered) {
        // Default to root element only
        filtered = Object.assign({}, data, { children: void 0 });
    }
    return filtered;
};

module.exports = get_filtered_tree;
