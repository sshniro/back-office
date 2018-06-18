'use strict';

const express = require('express');
const router = express.Router();

const authenticationProvider = require('../providers/authenticationProvider.js');

const driverQueryBuilder = require('../providers/driverQueryBuilder.js');


/* POST Add a new driver */
router.put('/select/vehicle', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, vehicle_id = req.query.vehicle_id || '';

    driverQueryBuilder.selectVehicle(user.user_id, vehicle_id).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.put('/location', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, vehicleLocationInfo = req.body || {};

    driverQueryBuilder.updateCurrentLocation(user.user_id, vehicleLocationInfo).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

module.exports = router;