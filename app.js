require('dotenv').config();

var createError = require('http-errors');
// var compression = require('compression');
const express = require('express');
// var path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('morgan');
const mysql = require('mysql');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const {AuthService} = require('./services/auth-service');

var app = express();
console.log("Environment initialized to: " + process.env.NODE_ENV);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text({ limit: "1024kb", defaultCharset: "utf-8" }));
app.use(cookieParser());

if(['test','production'].includes(process.env.NODE_ENV)){
  app.use(awsServerlessExpressMiddleware.eventContext());
}
app.use(cors());

// Database ....................................................................

var connPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT||5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true,
  typeCast: function castField( field, useDefaultTypeCasting ) {
		if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
			var bytes = field.buffer();
			// A Buffer in Node represents a collection of 8-bit unsigned integers.
			// Therefore, our single "bit field" comes back as the bits '0000 0001',
			// which is equivalent to the number 1.
			return( bytes[ 0 ] === 1 );
		}
		return( useDefaultTypeCasting() );
	}
});

// Makes a DAO factory for getting data access objects (to interact with database).
let {DaoFactory} = require('./services/database');
var daoFactory = new DaoFactory(connPool);
// globally available.
app.locals.database = daoFactory;

// security ...................................................................
// app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// Service for authentication and authorization
app.locals.authService = new AuthService(daoFactory);


// Routing .....................................................................
// For timing app, db response time
const serverTiming = require('server-timing');
app.use(serverTiming());
app.use(function(req, res, next){
  res.startTime('app');
  next();
});

var authRouter = require('./routes/auth');

var productsApiRouter = require('./routes/api/products-api');
var familiesApiRouter = require('./routes/api/families-api');
var equipmentApiRouter = require('./routes/api/equipment-api');
var groupsApiRouter = require('./routes/api/groups-api');
var customerIdentityRouter = require('./routes/customer-identity');
var apiRouter = require('./routes/api/api');
var dataloadApiRouter = require('./routes/api/dataload-api');

app.use('/auth', authRouter);

// api related
const authenticated = require('./routes/middleware/authenticated');

app.use('/api/v1/products', productsApiRouter);
app.use('/api/v1/families', familiesApiRouter);
app.use('/api/v1/equipment', equipmentApiRouter);
app.use('/api/v1/groups', groupsApiRouter);
app.use('/api/v1/customer-identity', customerIdentityRouter);
app.use('/api/v1', apiRouter);
app.use('/api/v1/dataload', authenticated(), dataloadApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(500).json({
    error: err.message
  });
});

module.exports = app;
