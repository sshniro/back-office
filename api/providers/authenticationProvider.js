'use strict';

const postgreSQLService = require('../services/postgreSQLService.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const baseConfig = require('../../config/baseConfig.js');

module.exports = {
    authenticateUser: authenticateUser,
    authorizeUser: authorizeUser,
    permit: permit
};

function authenticateUser(auth){

    return new Promise(function (resolve, reject) {

        auth.hashedPassword = bcrypt.hashSync(auth.password, baseConfig.saltRounds);

        let query = 'SELECT * FROM users WHERE username = \'' + auth.username + '\';';

        postgreSQLService.queryExecutor(query).then(function (queryResponse) {

            if(queryResponse.rowCount > 0){

                let passwordIsValid = bcrypt.compareSync(auth.password, queryResponse.rows[0].password);

                if(!passwordIsValid) return reject({success: false, message: 'Username or password wrong'});

                let token = jwt.sign({ id: auth.username }, baseConfig.secret, {
                    expiresIn: baseConfig.jwtTokenExpireTime
                });

                return resolve({success: true, message: 'Authorization Successful', token: token});
            }else{
                return reject({success: false, message: 'Username or password wrong'});
            }

        }).catch(function (err) {
            console.log(err);
            return reject({success: false, message: err});
        });

    });
}

function authorizeUser(req, res, next){

    let token = req.headers['x-access-token'] || '';

    if(!token){
        req.user = {role: 'User'};
        next();
    }else{

        verifyUser(token).then(function (response) {

            if(response.data.is_active){

                let arr = response.data.role.split(",");

                if(arr[0] === '' ) arr[0] = 'User';

                req.user = {
                    user_id: response.data.user_id,
                    username: response.data.username,
                    role: arr
                };
                next();
            }else {
                return res.status(403).json({success: false, message: 'Forbidden'});
            }

        }).catch(function (err) {
            res.status(401).json(err);
        });

    }

}

function verifyUser(token){

    return new Promise(function (resolve, reject) {

        jwt.verify(token, baseConfig.secret, function(err, decoded) {
            if (err) return reject({ authentication: false, message: 'Failed to authenticate token.' });

            let query = 'SELECT user_id, username, password, is_active, role FROM users WHERE username = \'' + decoded.id + '\';';

            postgreSQLService.queryExecutor(query).then(function (queryResponse) {

                if(queryResponse.rowCount > 0){
                    return resolve({success: true, message: 'Authorization Successful', data: queryResponse.rows[0]});
                }else{
                    return reject({success: false, message: 'No user found.'});
                }

            }).catch(function (err) {
                console.log(err);
                return reject({success: false, message: 'There was a problem finding the user.'});
            });

        });

    });
}

function permit(...allowed) {

    let isAllowed = roleArr => allowed.some(r=> roleArr.indexOf(r) >= 0)

    return (req, res, next) => {

        if (req.user && isAllowed(req.user.role))
            next();
        else {
            res.setHeader('WWW-Authenticate', 'x-access-token="Secure Area"');
            return res.status(401).json({success: false, message: 'Need authorization to continue'});
        }
    }
}