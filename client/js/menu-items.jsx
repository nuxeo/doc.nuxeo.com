'use strict';

var React = require('react');

var Item = React.createClass({
    propTypes: {
        path    : React.PropTypes.string.isRequired,
        slug    : React.PropTypes.string.isRequired,
        title   : React.PropTypes.string.isRequired,
        children: React.PropTypes.array.isRequired
    },
    render: function () {
        var ExpandControl = '';
        var isOpen = 'fa-rotate-90';
        var Children = '';
        if (this.props.children.length) {
            ExpandControl = <button ><i className={'fa fa-fw fa-chevron-right ' + isOpen} aria-hidden="true"></i> </button>;
            Children = <MenuItems data={this.props.children} />;
        }
        return (
            <li>
                {ExpandControl}
                <a href={'/' + this.props.path + this.props.slug + '/'}>{this.props.title}</a>
                {Children}
            </li>
        );
    }
});

var MenuItems = React.createClass({
    /**
     * Renders component
     * If props are not given, it sets default props for first depth container
     * @return {Object} React component
     */
    propTypes: {
        data       : React.PropTypes.array.isRequired,
        first_level: React.PropTypes.bool
    },
    // <a href="/{this.props.path}{this.props.slug}/">{this.props.title}</a>
    render: function () {
        var Items = this.props.data.map(function (item) {
            return (
                <Item key={item.id} path={item.path} slug={item.slug} title={item.title} children={item.children}/>
            );
        });
        var nested = (this.props.first_level) ? 'nested' : 'nested';
        return (
            <ul className={'menu vertical ' + nested}>
                {Items}
            </ul>
        );
    }
});

module.exports = MenuItems;
