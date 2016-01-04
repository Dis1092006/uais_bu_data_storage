// Get the packages we need
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var imd = require('./models/internal-monitoring-data');

/*var sql = require("mssql");
var dbConfig = {
	server: "172.16.241.26\\MSSQLSERVER",
	database: "RemoteControl_Dis",
	user: "sa",
	password: "Qwe`123",
	port: 1433,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	}
};
//instantiate a connection pool
var connection = new sql.Connection(dbConfig); //cp = connection pool
connection.connect(function (err) {
	if (err) {
		console.log(err);
		return;
	}
	console.log("connection OK");
	//conn.close();
});*/

var routes = require('./routes/index');
var users = require('./routes/users');

//function connectDB() {
//  "use strict";
//  var conn = new sql.Connection(dbConfig);
//  var req = new sql.Request(conn);
//
//  conn.connect(function(err) {
//    if (err) {
//      console.log(err);
//      return;
//    }
//    console.log("OK");
//    conn.close();
//  });
//}
//
//connectDB();

// Create our Express application
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
