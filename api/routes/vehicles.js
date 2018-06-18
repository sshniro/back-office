'use strict';

const express = require('express');
const router = express.Router();

const authenticationProvider = require('../providers/authenticationProvider.js');

const vehicleQueryBuilder = require('../providers/vehicleQueryBuilder.js');

/* POST Add a new driver */
router.post('/', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, vehicleInfo = req.body || {};

    vehicleQueryBuilder.insertVehicle(vehicleInfo, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

/* POST Batch add a new driver */
router.post('/batch', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, vehicleInfoSet = req.body || {}, i, promiseArr = [];

    for(i = 0; i < vehicleInfoSet.users.length; i += 1){
        promiseArr.push(vehicleQueryBuilder.insertVehicle(vehicleInfoSet.vehicles[i], user));
    }

    Promise.all(promiseArr).then(function(response) {
        return res.status(200).json({status: 'Ok', data: response});
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

/* GET Get all drivers || Get driver by username */
router.get('/', function(req, res, next){

    let user = req.user, vehicle_id = req.query.vehicle_id || '';
    if(req.query.driver_id) user.user_id = req.query.driver_id;

    vehicleQueryBuilder.getVehicleById(user.user_id, vehicle_id).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.put('/', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, vehicle_id = req.query.vehicle_id || '', vehicleInfo = req.body || {};

    vehicleQueryBuilder.updateVehicleByVehicleId(user.user_id, vehicle_id, vehicleInfo).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

module.exports = router;
