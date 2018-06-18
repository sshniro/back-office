'use strict';

const express = require('express');
const router = express.Router();

const authenticationProvider = require('../providers/authenticationProvider.js');

const usersQueryBuilder = require('../providers/usersQueryBuilder.js');

router.post('/', function(req, res, next){

    let userInfo = req.body || {};

    usersQueryBuilder.insertUser(userInfo).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

/* POST Batch add a new driver */
router.post('/batch', function(req, res, next){

    let userInfoSet = req.body || {}, i, promiseArr = [];

    for(i = 0; i < userInfoSet.users.length; i += 1){
        promiseArr.push(usersQueryBuilder.insertUser(userInfoSet.users[i]));
    }

    Promise.all(promiseArr).then(function(response) {
        return res.status(200).json({status: 'Ok', data: response});
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.post('/Authentication', function(req, res, next) {

    let auth = req.body || {};

    if(!auth.username || !auth.password){
        return res.status(401).json({status: 'Failed', message: 'Username or password missing'});
    }else{

        authenticationProvider.authenticateUser(auth).then(function (response) {
            return res.status(200).json(response);
        }).catch(function (err) {
            return res.status(401).json(err);
        });

    }

});

/* GET Get all drivers || Get driver by username */
router.get('/', function(req, res, next){

    let user = req.user;
    if(req.query.userId) user.user_id = req.query.userId;

    usersQueryBuilder.getUserByUserId(user).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

router.put('/', authenticationProvider.permit('Driver', 'Customer'), function(req, res, next){

    let user = req.user;
    let userInfo = req.body || {};

    usersQueryBuilder.updateUserByUserId(user, userInfo).then(function (response) {
        return res.status(200).json(response);
    }).catch(function (err) {
        return res.status(500).json(err);
    });

});

module.exports = router;
