'use strict';

const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const pg = require('pg');
const fs = require('fs');

const baseConfig = require('./config/baseConfig.js');

const indexRouter = require('./api/routes/index');
const usersRouter = require('./api/routes/users');
const vehiclesRouter = require('./api/routes/vehicles');
const ordersRouter = require('./api/routes/orders');
const driversRouter = require('./api/routes/drivers');

const postgreSQLService = require('./api/services/postgreSQLService');
const geo_helper = require('./api/helpers/geo-helper');

const googleMapsRouter = require('./api/routes/google-maps');

const authenticationProvider = require('./api/providers/authenticationProvider.js');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authenticationProvider.authorizeUser);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/drivers', driversRouter);
app.use('/vehicles', vehiclesRouter);
app.use('/maps', googleMapsRouter);
app.use('/orders', ordersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 8080;

if (module === require.main) {
    // Start the server
    const server = app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
}

initDatabase();

function initDatabase(){

    const connectionString = process.env.DATABASE_URL || baseConfig.dataaseURL;
    const client = new pg.Client(connectionString);

    client.connect();
    let sql = fs.readFileSync('./init_database.sql').toString();

    client.query(sql, function(err, result){
        if(err){
            console.log('error: ', err);
        }
        console.log('Database init Success;');

        initRedis();

        client.end();
    });
}

function initRedis(){

    let driverSelectQuery = 'SELECT * FROM drivers JOIN vehicles ON vehicles.vehicle_id = drivers.current_vehicle;';

    postgreSQLService.queryExecutor(driverSelectQuery).then(function (driverSelectQueryResponse) {

        let i, redisJson = {};;
        for(i = 0; i < driverSelectQueryResponse.rows.length; i += 1){
            if(driverSelectQueryResponse.rows[i].availability === 4){

                redisJson[driverSelectQueryResponse.rows[i].driver_id] = {
                    latitude: driverSelectQueryResponse.rows[i].current_location_latitude,
                    longitude: driverSelectQueryResponse.rows[i].current_location_longitude
                };

            }
        }

        geo_helper.addLocationsToRedis(redisJson).then(e => console.log('Successfully add/updated driver to redis.'));

    }).catch(function (err) {
        console.log(err);
        return reject({status: 'Failed', message: err});
    });
}

module.exports = app;
