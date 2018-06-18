module.exports = {
    googleAPIKEY: 'APIKEY',
    geoRange: 5000,
    driverGroupSegByDistanceVal: 500, // This conf will be used to divide the drivers in to group by distance and sort by rating
    dataaseURL: 'postgres://localhost:5432/nikethanselvanathan',
    secret: 'supersecret',
    saltRounds: 10,
    jwtTokenExpireTime: 86400  // 24 hours
};