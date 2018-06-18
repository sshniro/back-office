'use strict';

const express = require('express');
const router = express.Router();

const baseConfig = require('../../config/baseConfig.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/apiKey', function(req, res, next) {
    res.status(200).json({key : baseConfig.googleAPIKEY});
});

module.exports = router;
