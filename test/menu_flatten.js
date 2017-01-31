'use strict';
/* eslint-env es6 */

const test = require('tape');

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
                    id    : 'a',
                    title : 'A',
                    level : 2,
                    is_toc: true,
                    show  : true
                },
                {
                    id    : 'b',
                    title : 'B',
                    level : 3,
                    is_toc: true,
                    show  : false
                },
                {
                    id    : 'c',
                    title : 'C',
                    level : 4,
                    is_toc: true,
                    show  : false
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
                    id      : 'studio',
                    name    : 'Nuxeo Online Services',
                    url_full: '/studio/',
                    level   : 1,
                    parents : void 0,
                    active  : true
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
                    active  : true,
                    id      : 'studio',
                    name    : 'Nuxeo Online Services',
                    url_full: '/studio/',
                    level   : 1,
                    parents : void 0
                },
                {
                    active  : void 0,
                    id      : 'child1',
                    name    : 'Child One',
                    url_full: '/child1/',
                    level   : 2,
                    parents : ['studio']
                },
                {
                    active  : void 0,
                    id      : 'child2',
                    name    : 'Child Two',
                    url_full: '/child2/',
                    level   : 2,
                    parents : ['studio']
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
                    active  : void 0,
                    id      : 'studio',
                    name    : 'Nuxeo Online Services',
                    url_full: '/studio/',
                    level   : 1,
                    parents : void 0
                },
                {
                    active  : true,
                    id      : 'child1',
                    name    : 'Child One',
                    url_full: '/child1/',
                    level   : 2,
                    parents : ['studio']
                },
                {
                    id    : 'a',
                    title : 'A',
                    level : 2,
                    is_toc: true,
                    show  : true
                },
                {
                    active  : void 0,
                    id      : 'child2',
                    name    : 'Child Two',
                    url_full: '/child2/',
                    level   : 2,
                    parents : ['studio']
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
