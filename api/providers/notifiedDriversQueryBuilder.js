'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');

module.exports = {
    insertNotifiedDriver: insertNotifiedDriver
};

function insertNotifiedDriver(order_id, driver_id) {

    return new Promise(function (resolve, reject) {

        let query = 'INSERT INTO notified_drivers(order_id, driver_id) values(';

        query = query.concat(order_id + ', ' + driver_id);

        query = query.concat(') RETURNING *;');

        postgreSQLService.queryExecutor(query).then(function (queryResponse) {
            if(queryResponse.rowCount > 0) return resolve({success: true, data: queryResponse.rows[0]});
            else return reject({success: false, message: 'Failed to insert order'});
        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}