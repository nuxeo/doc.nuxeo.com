'use strict';
/* eslint-env browser */

module.exports = function ($) {
    var React = require('react');
    var ReactDOM = require('react-dom');
    var filter = require('./menu_filter');
    var treebeard_lib = require('react-treebeard');
    var Treebeard = treebeard_lib.Treebeard;
    var decorators = treebeard_lib.decorators;

    var $side_menu = $('#side-menu');
    var space = $side_menu.attr('data-space');
    var breadcrumbs = $('.breadcrumb a').map(function (index, element) {
        // Ignore first item (Home)
        return (index) ? $(element).text() : void 0;
    }).get();
    breadcrumbs.push($('#page-title').text());
    // console.log('breadcrmbs', breadcrumbs);
    var update_equalize = function (delay) {
        delay = delay || 0;
        var $page_container = $('#page-container');
        try {
            // Wait until next tick
            setTimeout(function () {
                $page_container.foundation('getHeights', function (heights) {
                    $page_container.foundation('applyHeight', heights);
                });
            }, delay);
        }
        catch (e) {
            /* eslint no-console: 0 */
            console.error('Failed equalize update', e);
        }
    };

    // console.log('space', space);
    if (space) {
        var display_children_only = (space.substr(-5) === 'nxdoc');
        $.ajax({
            url: '/' + space + '.json'
        }).done(function (data) {
            // console.log('got data', data);
            var menu_style = require('./menu_style');

            var set_toggled = function (item, toggle_item) {
                // console.log(name, 'item', item);
                if (toggle_item) {
                    if (item.name === toggle_item) {
                        item.toggled = true;
                        if (breadcrumbs.length) {
                            if (item.children) {
                                // console.log('children', item.children);
                                var next_toggle_item = breadcrumbs.shift();
                                item.children.forEach(function (child) {
                                    // console.log('child', child);
                                    set_toggled(child, next_toggle_item);
                                });
                            }
                        }
                        else {
                            item.active = true;
                        }
                    }
                }
            };
            set_toggled(data, breadcrumbs.shift());

            // Get first child of root
            if (data && data.children && display_children_only) {
                data.children.forEach(function (node) {
                    if (node.toggled) {
                        data = node;
                    }
                });
            }
            // console.log('current_item', current_item);

            decorators.Toggle = function () {
                /* eslint react/display-name: 0, react/prop-types: 0 */
                // console.log('props', props.node);

                return (
                    <i className="fa fa-fw fa-chevron-right" aria-hidden="true"></i>
                );
            };
            decorators.Header = function (props) {
                /* eslint react/display-name: 0, react/prop-types: 0 */
                // console.log('props', props.node);
                var is_active = (props.node.active) ? 'active' : '';
                return (
                    <a className={is_active} href={props.node.url.full}>{props.node.name}</a>
                );
            };

            var SideMenu = React.createClass({
                getInitialState: function () {
                    return {data: data};
                },
                onToggle: function (node, toggled) {
                    if (node.children) {
                        node.toggled = toggled;
                    }
                    this.setState({ cursor: node });
                },
                onFilterKeyUp: function (e) {
                    var filter_text = e.target.value.trim();
                    if (filter_text) {
                        var filtered = filter(data, filter_text);

                        // console.log('filtered', filtered);
                        this.setState({data: filtered});
                    }
                    else {
                        this.setState({data: data});
                    }
                },
                componentDidMount: function () {
                    // Update equalize
                    update_equalize();
                },
                componentDidUpdate: function () {
                    // Update equalize
                    update_equalize(500);
                },
                render: function () {
                    return (
                        <div>
                            <div className="input-group">
                                <input type="text"
                                    placeholder="FILTER"
                                    className="input-group-field"
                                    onKeyUp={this.onFilterKeyUp}
                                />
                            </div>
                            <Treebeard data={this.state.data} onToggle={this.onToggle} decorators={decorators} style={menu_style}/>
                        </div>
                    );
                }
            });

            ReactDOM.render(<SideMenu/>, document.getElementById('side-menu'));
        })
        .fail(function (jqXHR, textStatus) {
            console.error('Request failed: ' + textStatus );
        });
    }
};
