'use strict';
/* eslint-env es6 */

const React = require('react');
const ReactDOM = require('react-dom/server');
const treebeard_lib = require('react-treebeard');
const Treebeard = treebeard_lib.Treebeard;
const decorators = treebeard_lib.decorators;

const filter = require('./menu_filter');
const menu_style = require('./menu_style');

decorators.Toggle = function () {
    /* eslint react/display-name: 0, react/prop-types: 0 */
    // console.log('props', props.node);

    return (
        <i className="fa fa-fw fa-caret-right" aria-hidden="true"></i>
    );
};
decorators.Header = function (props) {
    /* eslint react/display-name: 0, react/prop-types: 0 */
    // console.log('props', props.node);
    const classes = [];
    if (props.node.active) {
        classes.push('active');
    }
    if (props.node.toc) {
        classes.push('toc');
    }
    const class_names = classes.join(' ');
    return (
        <a className={class_names} href={props.node && props.node.url && props.node.url.full}>{props.node.name}</a>
    );
};

const init_menu = function (data) {
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
        },
        componentDidUpdate: function () {
        },
        render: function () {
            return (
                <div>
                    <div className="input-container">
                        <div className="input-group">
                        <input type="text"
                        placeholder="FILTER"
                        className="input-group-field"
                        onKeyUp={this.onFilterKeyUp}
                        />
                        </div>
                    </div>
                    <Treebeard data={this.state.data} onToggle={this.onToggle} decorators={decorators} style={menu_style}/>
                </div>
            );
        }
    });
    return SideMenu;
};

const render = function (SideMenu) {
    return ReactDOM.renderToString(<SideMenu/>);
};

module.exports = {
    init_menu,
    render
};