'use strict';
/* eslint-env es6 */

const test = require('tap').test;

const menu_flatten = require('../modules/menu_flatten');

test('menu_flatten is a function', function (assert) {
    // Get typeof string
    const expected = menu_flatten && {}.toString.call(menu_flatten);

    assert.isEqual(expected, '[object Function]', 'menu_flatten is a function');
    assert.end();
});

test('menu_flatten returns values as expected', function (assert) {
    const tests = [
        {
            message : 'Undefined returns undefined',
            pages   : void 0,
            toc     : void 0,
            expected: void 0
        },
        {
            message: 'TOC only returns TOC',
            pages  : void 0,
            toc    : [
                {
                    id   : 'a',
                    title: 'A',
                    level: 2
                },
                {
                    id   : 'b',
                    title: 'B',
                    level: 3
                },
                {
                    id   : 'c',
                    title: 'C',
                    level: 4
                }
            ],
            expected: [
                {
                    toc_items: [
                        {
                            id     : 'a',
                            title  : 'A',
                            level  : 2,
                            show   : true,
                            is_toc : true,
                            classes: 'toc-item l1 h2'
                        },
                        {
                            id     : 'b',
                            title  : 'B',
                            level  : 3,
                            show   : false,
                            is_toc : true,
                            classes: 'toc-item l1 h3'
                        },
                        {
                            id     : 'c',
                            title  : 'C',
                            level  : 4,
                            show   : false,
                            is_toc : true,
                            classes: 'toc-item l1 h4'
                        }
                    ]
                }
            ]
        },
        {
            message: 'Process one page correctly',
            pages  : {
                id  : 'studio',
                name: 'Nuxeo Online Services',
                url : {
                    full: '/studio/'
                },
                active: true
            },
            toc     : void 0,
            expected: [
                {
                    id         : 'studio',
                    name       : 'Nuxeo Online Services',
                    url_full   : '/studio/',
                    active     : true,
                    level      : 1,
                    show       : false,
                    parents    : [],
                    has_control: false,
                    classes    : 'active l1'
                }
            ]
        },
        {
            message: 'Process children correctly',
            pages  : {
                id  : 'studio',
                name: 'Nuxeo Online Services',
                url : {
                    full: '/studio/'
                },
                active  : true,
                toggled : true,
                children: [
                    {
                        id  : 'child1',
                        name: 'Child One',
                        url : {
                            full: '/child1/'
                        }
                    },
                    {
                        id  : 'child2',
                        name: 'Child Two',
                        url : {
                            full: '/child2/'
                        }
                    }
                ]
            },
            toc     : void 0,
            expected: [
                {
                    id         : 'studio',
                    name       : 'Nuxeo Online Services',
                    url_full   : '/studio/',
                    active     : true,
                    level      : 1,
                    show       : true,
                    parents    : [],
                    has_control: false,
                    classes    : 'active l1'
                },
                {
                    id         : 'child1',
                    name       : 'Child One',
                    url_full   : '/child1/',
                    active     : void 0,
                    level      : 2,
                    show       : true,
                    parents    : [ 'studio' ],
                    has_control: false,
                    classes    : 'pstudio l2'
                },
                {
                    id         : 'child2',
                    name       : 'Child Two',
                    url_full   : '/child2/',
                    active     : void 0,
                    level      : 2,
                    show       : true,
                    parents    : [ 'studio' ],
                    has_control: false,
                    classes    : 'pstudio l2'
                }
            ]
        },
        {
            message: 'Process pages with children and TOC correctly',
            pages  : {
                id  : 'studio',
                name: 'Nuxeo Online Services',
                url : {
                    full: '/studio/'
                },
                toggled : true,
                children: [
                    {
                        active: true,
                        id    : 'child1',
                        name  : 'Child One',
                        url   : {
                            full: '/child1/'
                        }
                    },
                    {
                        id  : 'child2',
                        name: 'Child Two',
                        url : {
                            full: '/child2/'
                        }
                    }
                ]
            },
            toc: [
                {
                    id   : 'a',
                    title: 'A',
                    level: 2
                }
            ],
            expected: [
                {
                    id         : 'studio',
                    name       : 'Nuxeo Online Services',
                    url_full   : '/studio/',
                    active     : void 0,
                    level      : 1,
                    show       : true,
                    parents    : [],
                    has_control: false,
                    classes    : 'l1'
                },
                {
                    id         : 'child1',
                    name       : 'Child One',
                    url_full   : '/child1/',
                    active     : true,
                    level      : 2,
                    show       : true,
                    parents    : ['studio'],
                    has_control: false,
                    toc_classes: 'pstudio l2',
                    toc_items  : [
                        {
                            id     : 'a',
                            title  : 'A',
                            level  : 2,
                            show   : true,
                            is_toc : true,
                            classes: 'toc-item l2 h2'
                        }
                    ],
                    open   : true,
                    classes: 'pstudio active l2 open'
                },
                {
                    id         : 'child2',
                    name       : 'Child Two',
                    url_full   : '/child2/',
                    active     : void 0,
                    level      : 2,
                    show       : true,
                    parents    : ['studio'],
                    has_control: false,
                    classes    : 'pstudio l2'
                }
            ]
        }
    ];


    tests.forEach(function (single_test) {
        const actual = menu_flatten(single_test.pages, single_test.toc);
        assert.deepEqual(actual, single_test.expected, single_test.message);
    });

    assert.end();
});
