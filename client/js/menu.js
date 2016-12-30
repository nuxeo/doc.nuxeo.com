'use strict';
/* eslint-env browser */
/* global side_menu_data */

module.exports = function () {
    var React = require('react');
    var ReactDOM = require('react-dom');
    var init_menu = require('../../modules/react/left_menu.jsx').init_menu;

    var data = side_menu_data;

    var SideMenu = init_menu(data);
    ReactDOM.render(<SideMenu/>, document.getElementById('side-menu'));

};
