'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');

module.exports = {
    insertCustomer: insertCustomer,
    updateCustomer: updateCustomer,
    getCustomer: getCustomer
};

function insertCustomer(customerInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let card_info = customerInfo.card_info || '';

        let customerInsertQuery = 'INSERT INTO customers(customer_id, card_info) values(' + userInfo.user_id + ', \'' + card_info + '\') RETURNING *;';

        postgreSQLService.queryExecutor(customerInsertQuery).then(function (customerInsertQueryResponse) {

            if(customerInsertQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: customerInsertQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert user'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getCustomer(user_id){

    return new Promise(function (resolve, reject) {

        let customerSelectQuery = 'SELECT customer_id, card_info FROM customers WHERE customer_id = ' + user_id + ';';

        postgreSQLService.queryExecutor(customerSelectQuery).then(function (customerSelectQueryResponse) {

            if(customerSelectQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: customerSelectQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to get customer info'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateCustomer(driverInfo){

    return new Promise(function (resolve, reject) {

        let customerUpdateQuery = 'UPDATE customers SET card_info = \'' + driverInfo.card_info + '\' '
            + 'WHERE customer_id = ' + user.user_id + ' RETURNING *;';

        postgreSQLService.queryExecutor(customerUpdateQuery).then(function (customerUpdateQueryResponse) {

            if(customerUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: customerUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert user'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}