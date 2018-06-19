'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');

module.exports = {
    insertNotifiedDriver: insertNotifiedDriver,
    getNotifiedDriversByOrderId: getNotifiedDriversByOrderId,
    deleteNotifiedDriverByOrderIdAndDriverId: deleteNotifiedDriverByOrderIdAndDriverId
};

function insertNotifiedDriver(order_id, driver_id) {

    return new Promise(function (resolve, reject) {

        let query = 'INSERT INTO notified_drivers(order_id, driver_id) values(';

        query = query.concat(order_id + ', ' + driver_id);

        query = query.concat(') RETURNING *;');

        postgreSQLService.queryExecutor(query).then(function (queryResponse) {
            if(queryResponse.rowCount > 0) return resolve({success: true, data: queryResponse.rows[0]});
            else return reject({success: false, message: 'Failed to notified driver'});
        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}

function getNotifiedDriversByOrderId(order_id) {

    return new Promise(function (resolve, reject) {

        let query = 'SELECT * FROM notified_drivers WHERE order_id = ' + order_id + ';';

        postgreSQLService.queryExecutor(query).then(function (queryResponse) {
            if (queryResponse.rowCount > 0) return resolve({success: true, data: queryResponse.rows});
            else return reject({success: false, message: 'Failed to get notified driver'});
        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}

function deleteNotifiedDriverByOrderIdAndDriverId(order_id, driver_id) {

    return new Promise(function (resolve, reject) {

        let query = 'DELETE FROM notified_drivers WHERE order_id = ' + order_id + ' AND driver_id = ' + driver_id + ' RETURNING *;;';

        postgreSQLService.queryExecutor(query).then(function (queryResponse) {
            if (queryResponse.rowCount > 0) return resolve({success: true, data: queryResponse.rows[0]});
            else return reject({success: false, message: 'Failed to delete notified driver'});
        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}