'use strict';

var sortby = require('lodash.sortby');

var open_close_positions = function (placeholder_positions, key_field, position_field) {
    var sequential = sortby(placeholder_positions, position_field);
    var pairs = [];

    var item_start = 0;
    var add_pair = function () {
        var open_offset = 0;
        var close_offset = 1;

        var item_type = function (item) {
            return sequential[item] && sequential[item].type;
        };
        var open_item = function () {
            return item_start + open_offset;
        };
        var close_item = function () {
            return item_start + open_offset + close_offset;
        };

        var safety = 99;
        while (!(item_type(open_item()) === 'open' && item_type(close_item()) === 'close') && safety) {
            // console.log('status', item_type(open_item()), item_type(close_item()));
            if (item_type(close_item()) === 'open') {
                open_offset += close_offset;
                close_offset = 1;
                // console.log('next open ', item_start, open_item(), close_item());
            }
            else if (item_type(close_item()) !== 'close') {
                close_offset++;
                // console.log('next close', item_start, open_item(), close_item());
            }
            // console.log('plus');
            safety--;
        }
        // console.log('Found', open_item(), close_item(), sequential[open_item()].id, sequential[close_item()].id, safety);
        // console.log();
        if (!safety) {
            throw new Error('There was an issue processing placeholder positions');
        }
        pairs.push({
            key  : sequential[open_item()][key_field],
            start: sequential[open_item()][position_field],
            end  : sequential[close_item()][position_field]
        });
        delete sequential[open_item()];
        delete sequential[close_item()];

        if (!open_offset) {
            item_start = close_item() + 1;
        }
    };

    // Loop through adding matching pairs to array
    while (item_start < sequential.length - 1) {
        add_pair();
    }
    return pairs;

};

module.exports = open_close_positions;
