const redis = require("redis"),
    client = redis.createClient();

const geo = require('georedis').initialize(client);
const baseConfig = require('../../config/baseConfig.js');

client.on("error", function (err) {
    console.log("Error " + err);
});

const getCoordinatesOfADriver = (driverId) => {
    geo.location(driverId, function (err, location) {
        if (err) console.error(err)
        else console.log('Location for Toronto is: ', location.latitude, location.longitude)
    });
};

const getCoordinatesOfMultipleDrivers = (driverIdArray) => {
    geo.locations(driverIdArray, function (err, locations) {
        if (err) console.error(err)
        else {
            for (let locationName in locations) {
                console.log(locationName + "'s location is:", locations[locationName].latitude, locations[locationName].longitude)
            }
        }
    });
};

const defaultSearchForNearByVehicles = (lat, long, distanceInMeter) => {
    geo.nearby({latitude: lat, longitude: long}, distance, function (err, locations) {
        if (err) console.error(err);
        else console.log('nearby locations:', locations)
    })
};

const persistInRedis = (key, value) => {
    client.set(key, value, redis.print);
};

const getFromRedis = (key) => {
    return new Promise(function (resolve, reject) {
        client.get(key, function(err, reply) {
            // reply is null when the key is missing
            // console.log(reply);
            resolve(reply);
        });
    });
};

function getNearByVehicles(lat, long) {

    return new Promise(function (resolve, reject) {
        let options = {
            withCoordinates: true, // Will provide coordinates with locations, default false
            withHashes: true, // Will provide a 52bit Geohash Integer, default false
            withDistances: true, // Will provide distance from query, default false
            order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
            units: 'm', // or 'km', 'mi', 'ft', default 'm'
            count: 100, // Number of results to return, default undefined
            accurate: true // Useful if in emulated mode and accuracy is important, default false
        };

        // look for all points within ~5000m of Toronto with the options.
        geo.nearby({latitude: lat, longitude: long}, baseConfig.geoRange, options, function (err, locations) {
            if (err) {
                console.error(err);
                return reject();
            }

            resolve(locations);
        });
    });
}


function addLocationsToRedis(locationsArray) {
    return new Promise(function (resolve, reject) {
        geo.addLocations(locationsArray, function (err, reply) {
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log('added locations:', reply);
            resolve({'dataInserted': reply});
        });
    });
}

function addLocationToRedis(location) {
    return new Promise(function (resolve, reject) {
        geo.addLocation(location.key, location.body, function (err, reply) {
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log('added location to Redis:', reply);
            resolve({'dataInserted': reply});
        });
    });
}

function getLocationsFromRedis(locationsArray) {
    return new Promise(function (resolve, reject) {
        geo.locations(locationsArray, function(err, locations){
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log({'dataRetrieved': locations});
            resolve({'dataRetrieved': locations});
        });
    });
}

function getLocationFromRedis(location) {
    return new Promise(function (resolve, reject) {
        geo.location(location, function(err, location){
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log({'dataRetrieved': location});
            resolve({'dataRetrieved': location});
        });
    });
}

function removeLocationsFromRedis(locationsArray) {
    return new Promise(function (resolve, reject) {
        geo.removeLocations(locationsArray, function (err, reply) {
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log('removed locations:', reply);
            resolve({'dataRemoved': reply});
        });
    });
}

function removeLocationFromRedis(location) {
    return new Promise(function (resolve, reject) {
        geo.removeLocation(location, function (err, reply) {
            if (err) {
                console.error(err);
                return reject({error: err});
            }
            else console.log('removed location:', reply);
            resolve({'dataRemoved': reply});
        });
    });
}

module.exports = {
    addLocationsToRedis: addLocationsToRedis,
    addLocationToRedis: addLocationToRedis,

    getLocationsFromRedis: getLocationsFromRedis,
    getLocationFromRedis: getLocationFromRedis,

    removeLocationsFromRedis: removeLocationsFromRedis,
    removeLocationFromRedis: removeLocationFromRedis,

    getNearByVehicles: getNearByVehicles,

    persistInRedis: persistInRedis,
    getFromRedis: getFromRedis
};