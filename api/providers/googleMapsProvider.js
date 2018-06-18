'use strict';

let request = require('request');

const baseConfig = require('../../config/baseConfig.js');

module.exports = {
	calculateDistance: calculateDistance
};

function calculateDistance(json){

	let options = {
		method: 'GET',
		url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
		qs: { 
			units: 'imperial',
			origins: json.origins,
			destinations: json.destinations
			// , key : baseConfig.googleAPIKEY
		},
		headers: {
			'cache-control': 'no-cache' 
		} 
	};

	return new Promise(function (resolve, reject) {

		request(options, function (error, response, body) {
			if (error) return reject(error);

			let tempResponseBody = JSON.parse(body);

            if (tempResponseBody.status !== 'INVALID_REQUEST' && tempResponseBody.status !== 'REQUEST_DENIED') {
                return resolve(tempResponseBody);
            }else{
                return reject(tempResponseBody);
            }
        });

	});
}