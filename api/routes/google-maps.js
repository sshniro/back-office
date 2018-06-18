'use strict';

const express = require('express');
const router = express.Router();

const mapsUtilHelper = require('../helpers/mapsUtilHelper.js');

/* GET distance matrix listing. */
router.get('/distancematrix', function(req, res, next) {

    let driversToDestination = {
        origins : req.query.origins || '40.6905615,-73.9976592|40.6905615,-73.9976592|40.6905615,-73.9976592|40.6905615,-73.9976592|40.6905615,-73.9976592|40.6905615,-73.9976592|40.659569,-73.933783|40.729029,-73.851524|40.6860072,-73.6334271|40.598566,-73.7527626|40.659569,-73.933783|40.729029,-73.851524|40.6860072,-73.6334271',
        destinations : req.query.destinations || '40.6655101,-73.89188969999998|40.598566,-73.7527626'
    };

    mapsUtilHelper.sortDistanceMatrixFromOriginsToDestinations(driversToDestination).then(function (mapsUtilHelperResponse) {
        res.status(200).json(mapsUtilHelperResponse);
    }).catch(function (err) {
        res.status(500).send(err);
    });

});

module.exports = router;
