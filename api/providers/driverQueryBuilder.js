'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');
const vehicleQueryBuilder = require('../providers/vehicleQueryBuilder.js');
const geo_helper = require('../helpers/geo-helper.js');

module.exports = {
    insertDriver: insertDriver,
    updateDriver: updateDriver,
    getDriversBYIDs: getDriversBYIDs,
    getDriver: getDriver,
    selectVehicle: selectVehicle,
    updateCurrentLocation: updateCurrentLocation,
    updateRating: updateRating
};

function insertDriver(driverInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let license_number = driverInfo.license_number || '', total_rating = driverInfo.total_rating || 0, total_raters = driverInfo.total_raters || 0;

        let driverInsertQuery = 'INSERT INTO drivers(driver_id, license_number, total_rating, total_raters) values(' + userInfo.user_id + ', \'' + license_number + '\', ' + total_rating + ', ' + total_raters + ') RETURNING *;';

        postgreSQLService.queryExecutor(driverInsertQuery).then(function (driverInsertQueryResponse) {

            if(driverInsertQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: driverInsertQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert user'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getDriver(user_id){

    return new Promise(function (resolve, reject) {

        let driverSelectQuery = 'SELECT driver_id, CASE WHEN total_rating > 0 AND total_raters > 0 THEN (total_rating / total_raters) ELSE 0 END AS rating, ' +
            'total_raters, license_number, current_vehicle FROM drivers WHERE driver_id = ' + user_id + ';';

        postgreSQLService.queryExecutor(driverSelectQuery).then(function (driverSelectQueryResponse) {

            if(driverSelectQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: driverSelectQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to get driver info'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getDriversBYIDs(driverIdArr){

    return new Promise(function (resolve, reject) {

        let driverSelectQuery = 'SELECT driver_id, CASE WHEN total_rating > 0 AND total_raters > 0 THEN (total_rating / total_raters) ELSE 0 END AS rating ' +
            'FROM drivers WHERE driver_id IN (', i;

        for(i = 0; i < driverIdArr.length; i += 1){
            driverSelectQuery = driverSelectQuery.concat(driverIdArr[i]);

            if(i + 1 !== driverIdArr.length) driverSelectQuery = driverSelectQuery.concat(', ');
        }

        driverSelectQuery = driverSelectQuery.concat(');');

        postgreSQLService.queryExecutor(driverSelectQuery).then(function (queryResponse) {
            return resolve({success: true, data: queryResponse.rows});
        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}

function updateDriver(driverInfo){

    return new Promise(function (resolve, reject) {

        let driverUpdateQuery = 'UPDATE drivers SET license_number = \'' + driverInfo.license_number + '\''
            + 'WHERE driver_id = ' + driverInfo.user_id + ' RETURNING *;';

        postgreSQLService.queryExecutor(driverUpdateQuery).then(function (driverUpdateQueryResponse) {

            if(driverUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: driverUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert user'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function selectVehicle(driver_id, vehicle_id){

    return new Promise(function (resolve, reject) {

        let vehicleSelectQuery = 'SELECT * FROM vehicles WHERE driver_id = ' + driver_id + ' AND vehicle_id = ' + vehicle_id,

            driverSelectQuery = 'SELECT drivers.license_number, drivers.current_vehicle, (SELECT vehicles.availability FROM vehicles ' +
                'WHERE drivers.current_vehicle = vehicles.vehicle_id) FROM drivers WHERE drivers.driver_id = ' + driver_id + ';',

            driverUpdateQuery = 'UPDATE drivers SET current_vehicle = \'' + vehicle_id + '\' WHERE driver_id = ' + driver_id + ' RETURNING *;',
            promiseArr = [], vehicleSelectQueryResponse, driverSelectQueryResponse;

        promiseArr.push(postgreSQLService.queryExecutor(vehicleSelectQuery));
        promiseArr.push(postgreSQLService.queryExecutor(driverSelectQuery));

        Promise.all(promiseArr).then(function(response) {

            vehicleSelectQueryResponse = response[0], driverSelectQueryResponse = response[1];

            if(vehicleSelectQueryResponse.rowCount > 0){

                if(driverSelectQueryResponse.rowCount > 0 && driverSelectQueryResponse.rows[0].availability !== 5){

                    return postgreSQLService.queryExecutor(driverUpdateQuery)

                }
                else return reject({status: 'Failed', message: 'Current vehicle is on ride. Complete the ride to change the vehicle'});

            }
            else return reject({status: 'Failed', message: 'Vehicle doen\'t belong to the driver'});

        }).then(function (driverUpdateQueryResponse) {
            if (!driverUpdateQueryResponse) return;

            if(driverUpdateQueryResponse.rowCount > 0){

                if(vehicleSelectQueryResponse.rows[0].availability === 4) {
                    let redisJson = {
                        key: driverUpdateQueryResponse.rows[0].driver_id,
                        body: {
                            latitude: vehicleSelectQueryResponse.rows[0].current_location_latitude,
                            longitude: vehicleSelectQueryResponse.rows[0].current_location_longitude
                        }
                    };
                    geo_helper.addLocationToRedis(redisJson).then(e => console.log('Successfully add/updated driver to redis.'));
                } else {
                    geo_helper.removeLocationFromRedis(driverUpdateQueryResponse.rows[0].driver_id).then(e =>
                        console.log('Successfully removed driver to redis.')
                    );
                }

                return resolve({status: 'Ok', data: driverUpdateQueryResponse.rows[0]});
            }
            else return reject({status: 'Failed', message: 'Failed to insert user'});

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}


function updateCurrentLocation(driver_id, vehicleLocationInfo){

    return new Promise(function (resolve, reject) {

        let driverSelectQuery = 'SELECT * FROM drivers WHERE driver_id = ' + driver_id + ';';

        if(!vehicleLocationInfo.current_location_latitude || !vehicleLocationInfo.current_location_longitude){
            return reject({status: 'Failed', message: 'Both latitude & longitude of vehicle is required to update current location'});
        }

        postgreSQLService.queryExecutor(driverSelectQuery).then(function (driverSelectQueryResponse) {

            if(driverSelectQueryResponse.rowCount > 0){

                if(!driverSelectQueryResponse.rows[0].current_vehicle) return reject({status: 'Failed', message: 'Driver Not selected a vehicle'});

                vehicleQueryBuilder.updateVehicleCurrentLocationByVehicleId(driver_id, driverSelectQueryResponse.rows[0].current_vehicle, vehicleLocationInfo).then(function (response) {
                    return resolve(response);
                }).catch(function (err) {
                    return reject(err);
                });

            }
            else return reject({status: 'Failed', message: 'User not found'});

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateRating(driver_id, feedbackInfo){

    return new Promise(function (resolve, reject) {

        let driverSelectQuery = 'SELECT * FROM drivers WHERE driver_id = ' + driver_id + ';';

        postgreSQLService.queryExecutor(driverSelectQuery).then(function (driverSelectQueryResponse) {

            if(driverSelectQueryResponse.rowCount > 0){

                let driverUpdateQuery = 'UPDATE drivers SET total_rating = \''
                    + (driverSelectQueryResponse.rows[0].total_rating + feedbackInfo.driver_rating) + '\', total_raters = '
                    + (driverSelectQueryResponse.rows[0].total_raters + 1) + ' WHERE driver_id = ' + driver_id + ' RETURNING *;';

                console.log(driverUpdateQuery)

                return postgreSQLService.queryExecutor(driverUpdateQuery)
            }
            else return reject({status: 'Failed', message: 'User not found'});

        }).then(function (driverUpdateQueryResponse) {
            if (!driverUpdateQueryResponse) return;

            if(driverUpdateQueryResponse.rowCount > 0){

                return resolve({status: 'Ok', data: driverUpdateQueryResponse.rows[0]});
            }
            else return reject({status: 'Failed', message: 'Failed to update user'});

        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}