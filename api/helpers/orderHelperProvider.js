'use strict';

const sortJsonArray = require('sort-json-array');
const baseConfig = require('../../config/baseConfig.js');
const geo_helper = require('./geo-helper.js');
const mapsUtilHelper = require('./mapsUtilHelper.js');
const orderQueryBuilder = require('../providers/orderQueryBuilder.js');
const driverQueryBuilder = require('../providers/driverQueryBuilder.js');
const notifiedDriversQueryBuilder = require('../providers/notifiedDriversQueryBuilder.js');

module.exports = {
    getAvailableVehicles: getAvailableVehicles,
    notifyAvailableVehicles: notifyAvailableVehicles
};

function getAvailableVehicles(orderInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let promiseArr = [];

        promiseArr.push(mapsUtilHelper.calculateDistanceMatrixFromOriginsToDestinations(orderInfo));
        promiseArr.push(getVehiclesByDistanceFromOrigin(orderInfo, false));

        Promise.all(promiseArr).then(function(response) {
            let tempResponse = response[0];
            for(let key in orderInfo) tempResponse[key] = orderInfo[key];
            tempResponse.availableVehicles = response[1];

            return resolve({status: 'Ok', data: tempResponse});
        }).catch(function (err) {
            return reject({status: 'Failed', message: err});
        });

    });
}

function notifyAvailableVehicles(orderInfo, userInfo){

    return new Promise(function (resolve, reject) {

        let promiseArr = [];

        promiseArr.push(mapsUtilHelper.calculateDistanceMatrixFromOriginsToDestinations(orderInfo));
        promiseArr.push(getVehiclesByDistanceFromOrigin(orderInfo, true));

        Promise.all(promiseArr).then(function(response) {
            let completeOrderInfo = response[0];

            for(let key in orderInfo) completeOrderInfo[key] = orderInfo[key];
            completeOrderInfo.availableVehicles = response[1];

            return orderQueryBuilder.insertOrder(completeOrderInfo, userInfo);

        }).then(function (response) {

            sortAvailableVehiclesByDriverRating(response.data);
            return resolve({status: 'Ok', data: 'Successfully notified the drivers'});

        }).catch(function (err) {
            return reject({status: 'Failed', message: err});
        });

    });
}

function getVehiclesByDistanceFromOrigin(orderInfo, sortVehicelsByDistance) {

    let originSplit = orderInfo.origin_latitude_longitude.split(',');

    return new Promise(function (resolve, reject) {
        geo_helper.getNearByVehicles(originSplit[0], originSplit[1]).then(function (geoHelperResponse) {

            if(!sortVehicelsByDistance) return resolve(geoHelperResponse);

            let groups = [], i, previousIndex = 0, range = baseConfig.driverGroupSegByDistanceVal;

            for (i = 0; i < geoHelperResponse.length; i += 1) {

                if(geoHelperResponse[i].distance > range){

                    if((geoHelperResponse[i].distance - range) < baseConfig.driverGroupSegByDistanceVal && i > 0){
                        groups.push(geoHelperResponse.slice(previousIndex, i));
                        previousIndex = i;
                        range += baseConfig.driverGroupSegByDistanceVal;
                    }else {
                        range += baseConfig.driverGroupSegByDistanceVal;
                        i = i - 1;
                    }
                }
                if(i + 1 === geoHelperResponse.length){
                    groups.push(geoHelperResponse.slice(previousIndex, i + 1));
                }
            }

            return resolve(groups);

        }).catch(function (err) {
            console.log(err);
            return reject(err);
        });
    });

}

function sortAvailableVehiclesByDriverRating(orderInfo) {

    let i, j, k, driverArr = [];

    for(i = 0; i < orderInfo.availableVehicles.length; i += 1){
        for(j = 0; j < orderInfo.availableVehicles[i].length; j += 1){
            driverArr.push(orderInfo.availableVehicles[i][j].key);
        }
    }

    driverQueryBuilder.getDriversBYIDs(driverArr).then(function(response) {

        for(i = 0; i < orderInfo.availableVehicles.length; i += 1){
            for(j = 0; j < orderInfo.availableVehicles[i].length; j += 1){
                for(k = 0; k < response.data.length; k += 1){
                    if(orderInfo.availableVehicles[i][j].key === response.data[k].driver_id.toString()){
                        orderInfo.availableVehicles[i][j].rating = response.data[k].rating;
                    }
                }
            }
        }

        for (i = 0; i < orderInfo.availableVehicles.length; i += 1) {
            orderInfo.availableVehicles[i] = sortJsonArray(orderInfo.availableVehicles[i], 'rating', 'des');
        }

        notifyDrivers(orderInfo);

    }).catch(function (err) {
        console.log(err);
    });


}

function notifyDrivers(orderInfo) {

    if(orderInfo.availableVehicles.length > 0 && orderInfo.availableVehicles[0].length > 0) {

        notifiedDriversQueryBuilder.insertNotifiedDriver(orderInfo.order_id, orderInfo.availableVehicles[0][0].key).then(function (response) {

            if(orderInfo.availableVehicles[0].length > 1){
                orderInfo.availableVehicles[0].splice(0, 1);
            }else {
                orderInfo.availableVehicles.splice(0, 1);
            }

            if(orderInfo.availableVehicles.length > 0){ notifyDriversByDistance(orderInfo) }

        }).catch(function (err) {
            console.log(err);
        });

    }
}

function notifyDriversByDistance(orderInfo) {

    setTimeout(function(){

        orderQueryBuilder.getOrderStatus(orderInfo.order_id).then(function (response) {

            if(response.data.order_status === 1){
                let i, j, promiseArr = [];

                for (i = 0; i < 1; i += 1) {

                    for (j = 0; j < orderInfo.availableVehicles[i].length; j += 1) {
                        promiseArr.push(notifiedDriversQueryBuilder.insertNotifiedDriver(orderInfo.order_id, orderInfo.availableVehicles[i][j].key));
                    }
                    orderInfo.availableVehicles.splice(i, 1);

                    Promise.all(promiseArr).then(function(response) {
                        if(orderInfo.availableVehicles.length > 0){ notifyDriversByDistance(orderInfo) }
                    }).catch(function (err) {
                        console.log(err);
                    });

                }
            }else{
                console.log('Oder Not Found');
            }

        }).catch(function (err) {
            console.log(err);
        });

    }, 10 * 1000);
}