'use strict';

const pg = require('pg');

const baseConfig = require('../../config/baseConfig.js');

const connectionString = process.env.DATABASE_URL || baseConfig.dataaseURL;

module.exports = {
    queryExecutor: queryExecutor
};

function queryExecutor(stringQuery){

    return new Promise(function (resolve, reject) {

        const client = new pg.Client(connectionString);
        client.connect();

        const query = client.query(stringQuery);

        query.then(function (queryResponse) {
            client.end();
            return resolve(queryResponse);
        }).catch(function (err) {
            client.end();
            return reject(err);
        });

    });
}
