'use strict';

const googleMapsProvider = require('../providers/googleMapsProvider.js');

module.exports = {
    sortDistanceMatrixFromOriginsToDestinations: sortDistanceMatrixFromOriginsToDestinations,
    calculateDistanceMatrixFromOriginsToDestinations: calculateDistanceMatrixFromOriginsToDestinations
};

function sortDistanceMatrixFromOriginsToDestinations(driversToDestination) {

    return new Promise(function (resolve, reject) {
        googleMapsProvider.calculateDistance(driversToDestination).then(function (googleMapsProviderResponse) {

            let groups = [], i, j;
            for (i = 0; i < googleMapsProviderResponse.rows.length; i += 1) {

                for (j = 0; j < googleMapsProviderResponse.rows[i].elements.length; j += 1) {
                    let tempJson = {};
                    tempJson.origin_address = googleMapsProviderResponse.origin_addresses[i];
                    tempJson.destination_address = googleMapsProviderResponse.destination_addresses[j];
                    tempJson = Object.assign(tempJson, googleMapsProviderResponse.rows[i].elements[j]);
                    groups.push(tempJson)
                }
            }

            // resolve(googleMapsProviderResponse);
            resolve(groups);
        }).catch(function (err) {
            console.log(err);
            reject(err);
        });
    });

}


function calculateDistanceMatrixFromOriginsToDestinations(originToDestination) {

    let driversToDestination = {
        origins : originToDestination.origin_latitude_longitude,
        destinations : originToDestination.destination_latitude_longitude
    };

    return new Promise(function (resolve, reject) {
        googleMapsProvider.calculateDistance(driversToDestination).then(function (googleMapsProviderResponse) {

            let groups = [], i, j;
            for (i = 0; i < googleMapsProviderResponse.rows.length; i += 1) {

                for (j = 0; j < googleMapsProviderResponse.rows[i].elements.length; j += 1) {
                    let tempJson = {};
                    tempJson.origin_address = googleMapsProviderResponse.origin_addresses[i];
                    tempJson.destination_address = googleMapsProviderResponse.destination_addresses[j];
                    tempJson = Object.assign(tempJson, googleMapsProviderResponse.rows[i].elements[j]);
                    groups.push(tempJson)
                }
            }

            if(groups.length > 0){
                resolve(groups[0]);
            }else {
                reject('No path available.');
            }

        }).catch(function (err) {
            console.log(err);
            reject(err);
        });
    });

}


