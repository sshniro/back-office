'use strict';

const bcrypt = require('bcryptjs');
const baseConfig = require('../../config/baseConfig.js');

const postgreSQLService = require('../services/postgreSQLService.js');

const driverQueryBuilder = require('../providers/driverQueryBuilder.js');
const customerQueryBuilder = require('../providers/customerQueryBuilder.js');

module.exports = {
    insertUser: insertUser,
    getUserByUserId: getUserByUserId,
    updateUserByUserId: updateUserByUserId
};

function insertUser(userInfo){

    return new Promise(function (resolve, reject) {

        let salt = bcrypt.genSaltSync(baseConfig.saltRounds), userInsertQueryResponse;

        let userInsertQuery = 'INSERT INTO users(username, password, first_name, last_name, address, nic, mobile_number, is_active, role) values(\''
            + userInfo.username + '\', \'' + bcrypt.hashSync(userInfo.password, salt) + '\', \'' + userInfo.first_name + '\', \'' + userInfo.last_name
            + '\', \'' + userInfo.address + '\', \'' + userInfo.nic + '\', \'' + userInfo.mobile_number + '\', true, \'' + userInfo.role.toString()
            + '\') RETURNING *;';

        postgreSQLService.queryExecutor(userInsertQuery).then(function (response) {

            userInsertQueryResponse = response;

            if(userInsertQueryResponse.rowCount > 0){
                let promiseArr = [];

                if(userInfo.role.includes('Driver')) promiseArr.push(driverQueryBuilder.insertDriver(userInfo, userInsertQueryResponse.rows[0]));

                if(userInfo.role.includes('Customer')) promiseArr.push(customerQueryBuilder.insertCustomer(userInfo, userInsertQueryResponse.rows[0]));

                return Promise.all(promiseArr);

            }else{
                return reject({status: 'Failed', message: 'Failed to insert user'});
            }
        }).then(function(response) {

            if(userInfo.role.includes('Driver')) userInsertQueryResponse.rows[0].driver = response[0];

            if(userInfo.role.includes('Customer') && !userInfo.role.includes('Driver')) userInsertQueryResponse.rows[0].customer = response[0];

            if(userInfo.role.includes('Customer') && userInfo.role.includes('Driver')) userInsertQueryResponse.rows[0].customer = response[1];

            return resolve({status: 'Ok', data: userInsertQueryResponse.rows[0]});
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getUserByUserId(user){

    return new Promise(function (resolve, reject) {

        let userSelectQuery = 'SELECT user_id, username, first_name, last_name, address, nic, mobile_number, role ' +
            'FROM users ' +
            'WHERE users.user_id = ' + user.user_id + ';';

        let userSelectQueryResponse;

        postgreSQLService.queryExecutor(userSelectQuery).then(function (response) {
            userSelectQueryResponse = response;
            if(userSelectQueryResponse.rowCount > 0){

                userSelectQueryResponse.rows[0].role = userSelectQueryResponse.rows[0].role.split(",");

                let promiseArr = [];

                if(userSelectQueryResponse.rows[0].role.includes('Driver')) promiseArr.push(driverQueryBuilder.getDriver(user.user_id));

                if(userSelectQueryResponse.rows[0].role.includes('Customer')) promiseArr.push(customerQueryBuilder.getCustomer(user.user_id));

                return Promise.all(promiseArr);

            }else{
                return reject({status: 'Failed', message: 'User not found'});
            }
        }).then(function(response) {

            if(userSelectQueryResponse.rows[0].role.includes('Driver'))
                userSelectQueryResponse.rows[0].driver = response[0];

            if(userSelectQueryResponse.rows[0].role.includes('Customer') && !userSelectQueryResponse.rows[0].role.includes('Driver'))
                userSelectQueryResponse.rows[0].customer = response[0];

            if(userSelectQueryResponse.rows[0].role.includes('Customer') && userSelectQueryResponse.rows[0].role.includes('Driver'))
                userSelectQueryResponse.rows[0].customer = response[1];

            return resolve({status: 'Ok', data: userSelectQueryResponse.rows[0]});
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateUserByUserId(user, userInfo){

    return new Promise(function (resolve, reject) {

        let userSelectQuery = 'SELECT users.user_id, users.first_name, users.last_name, users.address, users.nic, users.mobile_number, users.role, ' +
            'drivers.license_number, customers.card_info ' +
            'FROM users ' +
            'JOIN drivers ON users.user_id = drivers.driver_id ' +
            'JOIN customers ON users.user_id = customers.customer_id  ' +
            'WHERE users.user_id = ' + user.user_id + ';';

        let userInfoDb, userSelectQueryResponse, promiseArr = [], tempRoleArr;

        postgreSQLService.queryExecutor(userSelectQuery).then(function (userSelectQueryResponse) {
            if(userSelectQueryResponse.rowCount > 0){
                userInfoDb = userSelectQueryResponse.rows[0];

                for(let key in userInfo) userInfoDb[key] = userInfo[key];

                if(userInfoDb['role']) userInfoDb.role = userInfo.role.toString();

                let userUpdateQuery = 'UPDATE users SET first_name = \'' + userInfoDb.first_name + '\', last_name = \'' + userInfoDb.last_name
                    + '\', address = \'' + userInfoDb.address + '\', nic = \'' + userInfoDb.nic + '\', mobile_number = \''
                    + userInfoDb.mobile_number + '\', role = \'' + userInfoDb.role + '\' '
                    + 'WHERE user_id = ' + user.user_id + ' RETURNING *;';

                return postgreSQLService.queryExecutor(userUpdateQuery)

            }else{
                return reject({status: 'Failed', message: 'User not found'});
            }
        }).then(function (response) {

            userSelectQueryResponse = response;
            if(userSelectQueryResponse.rowCount > 0){

                tempRoleArr = userInfoDb.role.split(",");

                if(tempRoleArr.includes('Driver')) promiseArr.push(driverQueryBuilder.updateDriver(userInfoDb));

                if(tempRoleArr.includes('Customer')) promiseArr.push(customerQueryBuilder.updateCustomer(userInfoDb));

                return Promise.all(promiseArr);

            }else{
                return reject({status: 'Failed', message: 'Failed to Update'});
            }
        }).then(function(response) {

            delete userSelectQueryResponse.rows[0].password;

            if(tempRoleArr.includes('Driver')) userSelectQueryResponse.rows[0].driver = response[0];

            if(tempRoleArr.includes('Customer') && !tempRoleArr.includes('Driver')) userSelectQueryResponse.rows[0].customer = response[0];

            if(tempRoleArr.includes('Customer') && tempRoleArr.includes('Driver')) userSelectQueryResponse.rows[0].customer = response[1];

            return resolve({status: 'Ok', data: userSelectQueryResponse.rows[0]});
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}