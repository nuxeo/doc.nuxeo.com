'use strict';

/**
 * Returns boolean true if node.name matches the filter text
 *
 * @param   {Object} node    Object containing name to match
 * @param   {String} filter  String to match
 *
 * @returns {boolean}
 */
var matcher = function (node, filter) {
    return node.name.toLowerCase().indexOf(filter) !== -1;
};


/**
 * Filters a tree keeping parents of matched items. Also expands parents so they are visible.
 *
 * @param  {Object} node    Tree to look for matches within
 * @param  {String} filter  String to search for
 *
 * @returns {Object}        Tree with matches or undefined
 */
var filter_items = function (node, filter) {
    var children = void 0;
    if (node.children) {
        node.children.forEach(function (child) {
            var keep_child = filter_items(child, filter);
            if (keep_child) {
                children = children || [];
                children.push(keep_child);
            }
        });
    }

    return (children || matcher(node, filter)) ? Object.assign({}, node, { children: children }, { toggled: true }) : void 0;
};


/**
 * Filters a tree keeping parents of matched items. Root element returned only if no matches.
 *
 * @param   {Object} data    Tree data
 * @param   {String} filter  String to search for
 *
 * @returns {Object}
 */
var get_filtered_tree = function (data, filter) {
    filter = filter.toLowerCase();
    var filtered;

    // Only process if filter is 2 or more chars
    if (filter.length >= 2) {
        filtered = filter_items(data, filter);
    }
    if (!filtered) {
        // Default to root element only
        filtered = Object.assign({}, data, { children: void 0 });
    }
    return filtered;
};

module.exports = get_filtered_tree;
