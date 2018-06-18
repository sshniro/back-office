'use strict';

const express = require('express');
const router = express.Router();

const authenticationProvider = require('../providers/authenticationProvider.js');
const orderQueryBuilder = require('../providers/orderQueryBuilder.js');
const orderHelperProvider = require('../helpers/orderHelper.js');

router.get('/available/vehicles', authenticationProvider.permit('Customer'), function(req, res, next){

    let user = req.user, orderInfo = req.query || {};

    orderHelperProvider.getAvailableVehicles(orderInfo, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.post('/available/vehicles', authenticationProvider.permit('Customer'), function(req, res, next){

    let user = req.user, orderInfo = req.body || {};

    orderHelperProvider.notifyAvailableVehicles(orderInfo, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.get('/', authenticationProvider.permit('Driver', 'Customer'), function(req, res, next){

    let user = req.user, order_id = req.query.order_id || '';

    orderQueryBuilder.getOrders(order_id, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.put('/accept', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, order_id = req.query.order_id || '';

    orderQueryBuilder.acceptOrder(order_id, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.put('/complete', authenticationProvider.permit('Driver'), function(req, res, next){

    let user = req.user, order_id = req.query.order_id || '';

    orderQueryBuilder.completeOrder(order_id, user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.post('/feedback', authenticationProvider.permit('Customer'), function(req, res, next){

    // Update Order Feedback & Driver Rating

    let user = req.user, feedbackInfo = req.body || '';

    console.log(feedbackInfo);

    orderQueryBuilder.addFeedback(user.user_id, feedbackInfo).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

module.exports = router;
