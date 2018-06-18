'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');
const usersQueryBuilder = require('../providers/usersQueryBuilder.js');
const driverQueryBuilder = require('../providers/driverQueryBuilder.js');
const vehicleQueryBuilder = require('../providers/vehicleQueryBuilder.js');

module.exports = {
    insertOrder: insertOrder,
    getOrderStatus: getOrderStatus,
    getOrders: getOrders,
    acceptOrder: acceptOrder,
    completeOrder: completeOrder
};

function insertOrder(orderInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let orderInsertQuery = 'INSERT INTO orders(customer_id, origin_latitude_longitude, destination_latitude_longitude, origin_address, ' +
            'destination_address, distance, duration, order_status, timestamp, payment_method) values(' + userInfo.user_id + ', \''
            + orderInfo.origin_latitude_longitude + '\', \'' + orderInfo.destination_latitude_longitude + '\', \'' + orderInfo.origin_address + '\', \''
            + orderInfo.destination_address + '\', ' + orderInfo.distance.value + ', ' + orderInfo.duration.value + ', ' + 1 + ', ' + orderInfo.timestamp + ', '
            + orderInfo.payment_method + ') RETURNING *;';

        postgreSQLService.queryExecutor(orderInsertQuery).then(function (orderInsertQueryResponse) {

            if(orderInsertQueryResponse.rowCount > 0){
                orderInsertQueryResponse.rows[0].availableVehicles = orderInfo.availableVehicles;
                return resolve({status: 'Ok', data: orderInsertQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert vehicle'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getOrderStatus(order_id) {

    return new Promise(function (resolve, reject) {

        let orderSelectQuery = 'SELECT customer_id, order_status FROM orders WHERE order_id = ' + order_id + ';';

        postgreSQLService.queryExecutor(orderSelectQuery).then(function (orderSelectQueryResponse) {

            if(orderSelectQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: orderSelectQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert vehicle'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });

}

function getOrders(order_id, userInfo) {

    return new Promise(function (resolve, reject) {

        let orderSelectQuery = 'SELECT *, array(SELECT driver_id FROM notified_drivers where order_id = orders.order_id) as "notified_drivers" ' +
            'FROM orders WHERE';
        let i, j, k, promiseArr = [], returnResponse;

        if(order_id !== '') orderSelectQuery = orderSelectQuery.concat(' order_id = ' + order_id + ';');
        else orderSelectQuery = orderSelectQuery.concat(' customer_id = ' + userInfo.user_id + ';');

        postgreSQLService.queryExecutor(orderSelectQuery).then(function (orderSelectQueryResponse) {

            if(orderSelectQueryResponse.rowCount > 0){
                returnResponse = orderSelectQueryResponse.rows;

                for(i = 0; i < returnResponse.length; i += 1){
                    for(j = 0; j < returnResponse[i].notified_drivers.length; j += 1){
                        let user = {
                            user_id: returnResponse[i].notified_drivers[j]
                        };
                        promiseArr.push(usersQueryBuilder.getUserByUserId(user));
                    }
                }

                return Promise.all(promiseArr);

            }else{
                return reject({status: 'Failed', message: 'No order related to order id or customer id' });
            }
        }).then(function(response) {

            for(i = 0; i < returnResponse.length; i += 1){
                for(j = 0; j < returnResponse[i].notified_drivers.length; j += 1){

                    for(k = 0; k < response.length; k += 1){
                        if(response[k].data.user_id === returnResponse[i].notified_drivers[j]){
                            returnResponse[i].notified_drivers[j] = response[k].data;
                        }
                    }

                }
            }

            return resolve({status: 'Ok', data: returnResponse});

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });

}

function acceptOrder(order_id, driverInfo) {

    return new Promise(function (resolve, reject) {

        let orderSelectQuery = 'SELECT *, array(SELECT driver_id FROM notified_drivers WHERE order_id = orders.order_id) AS notified_drivers ' +
            'FROM orders WHERE order_id = ' + order_id + ';';

        let driverQueryBuilderResponse;

        postgreSQLService.queryExecutor(orderSelectQuery).then(function (orderSelectQueryResponse) {

            if(orderSelectQueryResponse.rowCount > 0){

                let returnResponse = orderSelectQueryResponse.rows[0];

                if(returnResponse.notified_drivers.includes(driverInfo.user_id) && returnResponse.order_status === 1){
                    return driverQueryBuilder.getDriver(driverInfo.user_id);
                }else {
                    return reject({status: 'Failed', message: 'Order is already accepted by another user'});
                }

            }else{
                return reject({status: 'Failed', message: 'Failed to insert vehicle'});
            }
        }).then(function (response) {
            driverQueryBuilderResponse = response;
            return vehicleQueryBuilder.updateVehicleAvailability(driverQueryBuilderResponse.data, 5);
        }).then(function (response) {
            let orderUpdateQuery = 'UPDATE orders SET order_acceptor_vehicle_id = ' + driverQueryBuilderResponse.data.current_vehicle + ', order_status = '
                + 2 + ' WHERE order_id = ' + order_id + ' RETURNING *;';

            return postgreSQLService.queryExecutor(orderUpdateQuery);

        }).then(function (orderUpdateQueryResponse) {
            if(orderUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: orderUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to accept order'});
            }

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });

}

function completeOrder(order_id, driverInfo) {

    return new Promise(function (resolve, reject) {

        let orderSelectQuery = 'SELECT * FROM orders JOIN vehicles ON vehicles.vehicle_id = orders.order_acceptor_vehicle_id ' +
            'WHERE orders.order_id = ' + order_id + ';';

        postgreSQLService.queryExecutor(orderSelectQuery).then(function (orderSelectQueryResponse) {

            if(orderSelectQueryResponse.rowCount > 0){

                let returnResponse = orderSelectQueryResponse.rows[0];

                if(returnResponse.driver_id === driverInfo.user_id && returnResponse.order_status === 2){
                    return driverQueryBuilder.getDriver(driverInfo.user_id);
                }else {
                    return reject({status: 'Failed', message: 'Order is already accepted by another user'});
                }

            }else{
                return reject({status: 'Failed', message: 'Failed to insert vehicle'});
            }
        }).then(function (response) {
            if (!response) return;
            return vehicleQueryBuilder.updateVehicleAvailability(response.data, 4);
        }).then(function (response) {
            let orderUpdateQuery = 'UPDATE orders SET order_status = ' + 3 + ' WHERE order_id = ' + order_id + ' RETURNING *;';
            return postgreSQLService.queryExecutor(orderUpdateQuery);
        }).then(function (orderUpdateQueryResponse) {
            if(orderUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: orderUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to accept order'});
            }

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });

}