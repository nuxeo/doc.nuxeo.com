'use strict';
/* eslint-env es6, react */

const debug_lib = require('debug');
const debug = debug_lib('metalsmith-menu');
const info = debug_lib('metalsmith-menu:info');
// const error = debug_lib('metalsmith-menu:error');

const multimatch = require('multimatch');
const clone = require('lodash.clonedeep');
const React = require('react');
const ReactDOM = require('react-dom/server');
const treebeard_lib = require('react-treebeard');
const Treebeard = treebeard_lib.Treebeard;
const decorators = treebeard_lib.decorators;

const filter = require('../../client/js//menu_filter');
const menu_style = require('../../client/js//menu_style');

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
    const is_active = (props.node.active) ? 'active' : '';
    return (
        <a className={is_active} href={props.node && props.node.url && props.node.url.full}>{props.node.name}</a>
    );
};


const menu = function (options) {
    debug('Options: %o', options);
    return function (files, metalsmith, done) {
        const metadata = metalsmith.metadata();

        multimatch(Object.keys(files), '**/*.html').forEach((filename) => {
            const file = files[filename];
            debug('filename: %s, space_path: %s', filename, file.url && file.url.key.space_path);
            let data = clone(metadata.hierarchies[file.url.key.space_path]);
            if (!file.no_side_menu && data) {
                const children_only = (file.url.key.space === 'nxdoc');

                let breadcrumbs = clone(file.hierarchy.parents);
                breadcrumbs = breadcrumbs && breadcrumbs.map(x => x.name) || [];
                breadcrumbs.push(file.title);

                const set_toggled = function (item, toggle_item) {
                    // console.log(name, 'item', item);
                    if (toggle_item) {
                        if (item.name === toggle_item) {
                            item.toggled = true;
                            if (breadcrumbs.length) {
                                if (item.children) {
                                    // console.log('children', item.children);
                                    const next_toggle_item = breadcrumbs.shift();
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
                if (data && data.children && children_only) {
                    data.children.forEach(function (node) {
                        if (node.toggled) {
                            data = node;
                        }
                    });
                }

                const SideMenu = React.createClass({
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
                        const filter_text = e.target.value.trim();
                        if (filter_text) {
                            const filtered = filter(data, filter_text);

                            // console.log('filtered', filtered);
                            this.setState({data: filtered});
                        }
                        else {
                            this.setState({data: data});
                        }
                    },
                    componentDidMount: function () {
                        // Update equalize
                        // update_equalize();
                    },
                    componentDidUpdate: function () {
                        // Update equalize
                        // update_equalize(500);
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
                const menu_html = ReactDOM.renderToString(<SideMenu/>);
                const contents = file.contents.toString();
                file.contents = Buffer.from(contents.replace('<menu>', menu_html));
            }
        });

        return done();
    };
};

module.exports = menu;
