'use strict';

var debug_lib = require('debug');
var debug = debug_lib('metalsmith-customers-by-industry');
// var error = debug_lib('metalsmith-customers-by-industry:error');

var customers_by_industry = function () {
    debug('Customers by Industry');
    return function (files, metalsmith, done) {
        var metadata = metalsmith.metadata();
        metadata.industries = metadata.industries || {en: {}, fr: {}};

        metadata.collections.customers.forEach(function (customer) {
            // var customer = metadata.collections.customers[customer_id];
            // debug('Customers - obj: %o', customer);

            if (customer && customer.industry && customer.industry.length) {
                customer.industry.forEach(function (industry) {
                    // var industry = customer.industry[industry_id];
                    metadata.industries[customer.lang][industry] = metadata.industries[customer.lang][industry] || [];
                    metadata.industries[customer.lang][industry].push(customer);
                });
            }
        });

        done();
    };
};

module.exports = customers_by_industry;
