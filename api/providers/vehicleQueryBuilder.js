'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');
const geo_helper = require('../helpers/geo-helper.js');

module.exports = {
    insertVehicle: insertVehicle,
    getVehicleById: getVehicleById,
    updateVehicleByVehicleId: updateVehicleByVehicleId,
    updateVehicleCurrentLocationByVehicleId: updateVehicleCurrentLocationByVehicleId,
    updateVehicleAvailability: updateVehicleAvailability
};

function insertVehicle(vehicleInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let vehicleInsertQuery = 'INSERT INTO vehicles(driver_id, vehicle_type, vehicle_model, ownership_status, insurance, current_location_latitude, '
            + 'current_location_longitude, availability) values(' + userInfo.user_id + ', ' + vehicleInfo.vehicle_type + ', \'' + vehicleInfo.vehicle_model
            + '\', \'' + vehicleInfo.ownership_status + '\', \'' + vehicleInfo.insurance + '\', \'' + vehicleInfo.current_location_latitude + '\', \''
            + vehicleInfo.current_location_longitude + '\', ' + vehicleInfo.availability + ') RETURNING *;';

        postgreSQLService.queryExecutor(vehicleInsertQuery).then(function (vehicleInsertQueryResponse) {

            if(vehicleInsertQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: vehicleInsertQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'Failed to insert vehicle'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function getVehicleById(driver_id, vehicle_id){

    return new Promise(function (resolve, reject) {

        let vehicleSelectQuery = 'SELECT * FROM vehicles WHERE driver_id = ' + driver_id;

        if(vehicle_id !== '') vehicleSelectQuery = vehicleSelectQuery.concat(' AND vehicle_id = ' + vehicle_id);

        vehicleSelectQuery = vehicleSelectQuery.concat(';');

        postgreSQLService.queryExecutor(vehicleSelectQuery).then(function (vehicleSelectQueryResponse) {

            if(vehicleSelectQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: vehicleSelectQueryResponse.rows});
            }else{
                return reject({status: 'Failed', message: 'No vehicle related to driver id'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateVehicleByVehicleId(driver_id, vehicle_id, vehicleInfo){

    return new Promise(function (resolve, reject) {

        let vehicleSelectQuery = 'SELECT * FROM vehicles WHERE driver_id = ' + driver_id +' AND vehicle_id = ' + vehicle_id + ';';

        postgreSQLService.queryExecutor(vehicleSelectQuery).then(function (vehicleSelectQueryResponse) {

            if(vehicleSelectQueryResponse.rowCount > 0){

                let vehicleInfoDb = vehicleSelectQueryResponse.rows[0];
                for(let key in vehicleInfo) vehicleInfoDb[key] = vehicleInfo[key];

                let vehicleUpdateQuery = 'UPDATE vehicles SET vehicle_type = ' + vehicleInfoDb.vehicle_type + ', vehicle_model = \''
                    + vehicleInfoDb.vehicle_model + '\', ownership_status = \'' + vehicleInfoDb.ownership_status + '\', insurance = \''
                    + vehicleInfoDb.insurance + '\' '
                    + 'WHERE driver_id = ' + driver_id +' AND vehicle_id = ' + vehicle_id + ' RETURNING *;';

                return postgreSQLService.queryExecutor(vehicleUpdateQuery);

            }else{
                return reject({status: 'Failed', message: 'Vehicle is not related to driver id'});
            }
        }).then(function (vehicleUpdateQueryResponse) {

            if(vehicleUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: vehicleUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'No vehicle related to driver id'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateVehicleCurrentLocationByVehicleId(driver_id, vehicle_id, vehicleLocationInfo){

    return new Promise(function (resolve, reject) {

        let vehicleSelectQuery = 'SELECT * FROM vehicles WHERE driver_id = ' + driver_id +' AND vehicle_id = ' + vehicle_id + ';';

        postgreSQLService.queryExecutor(vehicleSelectQuery).then(function (vehicleSelectQueryResponse) {

            if(vehicleSelectQueryResponse.rowCount > 0){

                let vehicleUpdateQuery = 'UPDATE vehicles SET current_location_latitude = \'' + vehicleLocationInfo.current_location_latitude + '\', '
                    + 'current_location_longitude = \'' + vehicleLocationInfo.current_location_longitude + '\' '
                    + 'WHERE driver_id = ' + driver_id +' AND vehicle_id = ' + vehicle_id + ' RETURNING *;';

                return postgreSQLService.queryExecutor(vehicleUpdateQuery);

            }else{
                return reject({status: 'Failed', message: 'Vehicle is not related to driver id'});
            }
        }).then(function (vehicleUpdateQueryResponse) {

            if(vehicleUpdateQueryResponse.rowCount > 0){

                let redisJson = {
                    key: driver_id,
                    body: {
                        latitude: vehicleUpdateQueryResponse.rows[0].current_location_latitude,
                        longitude: vehicleUpdateQueryResponse.rows[0].current_location_longitude
                    }
                };
                geo_helper.addLocationToRedis(redisJson).then(e => console.log('Successfully add/updated driver to redis.'));

                return resolve({status: 'Ok', data: vehicleUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'No vehicle related to driver id'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}

function updateVehicleAvailability(driverInfo, vehicleAvailability){

    return new Promise(function (resolve, reject) {

        let vehicleSelectQuery = 'SELECT * FROM vehicles WHERE driver_id = ' + driverInfo.driver_id +' AND vehicle_id = ' + driverInfo.current_vehicle + ';';

        postgreSQLService.queryExecutor(vehicleSelectQuery).then(function (vehicleSelectQueryResponse) {

            if(vehicleSelectQueryResponse.rowCount > 0){

                let vehicleUpdateQuery = 'UPDATE vehicles SET availability = ' + vehicleAvailability
                    + ' WHERE driver_id = ' + driverInfo.driver_id +' AND vehicle_id = ' + driverInfo.current_vehicle + ' RETURNING *;';

                if(vehicleAvailability === 5 && vehicleSelectQueryResponse.rows[0].availability === 4){
                    geo_helper.removeLocationFromRedis(vehicleSelectQueryResponse.rows[0].driver_id).then(e =>
                        console.log('Successfully removed driver to redis.')
                    );

                    return postgreSQLService.queryExecutor(vehicleUpdateQuery);
                }else if(vehicleAvailability === 4 && vehicleSelectQueryResponse.rows[0].availability === 5){

                    let redisJson = {
                        key: vehicleSelectQueryResponse.rows[0].driver_id,
                        body: {
                            latitude: vehicleSelectQueryResponse.rows[0].current_location_latitude,
                            longitude: vehicleSelectQueryResponse.rows[0].current_location_longitude
                        }
                    };
                    geo_helper.addLocationToRedis(redisJson).then(e => console.log('Successfully add/updated driver to redis.'));


                    return postgreSQLService.queryExecutor(vehicleUpdateQuery);
                }else{
                    if(vehicleAvailability === 5) return reject({status: 'Failed', message: 'Complete previous order before accepting another'});
                    else if(vehicleAvailability === 4) return reject({status: 'Failed', message: 'Accept an order to notify completion'});
                }

            }else{
                return reject({status: 'Failed', message: 'Vehicle is not related to driver id'});
            }
        }).then(function (vehicleUpdateQueryResponse) {

            if(vehicleUpdateQueryResponse && vehicleUpdateQueryResponse.rowCount > 0){
                return resolve({status: 'Ok', data: vehicleUpdateQueryResponse.rows[0]});
            }else{
                return reject({status: 'Failed', message: 'No vehicle related to driver id'});
            }
        }).catch(function (err) {
            console.log(err);
            return reject({status: 'Failed', message: err});
        });

    });
}