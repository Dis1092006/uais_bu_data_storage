var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');

var imdRoutes = require('./routes/imd');
var schemeRoutes = require('./routes/scheme');
var zonesRoutes = require('./routes/zones');
var nodesRoutes = require('./routes/nodes');
var serversRoutes = require('./routes/servers');
var dbmsServersRoutes = require('./routes/dbms-servers');
var historyRoutes = require('./routes/history');
var databasesRoutes = require('./routes/databases');
var databaseSizesRoutes = require('./routes/database-sizes');
var backupsRoutes = require('./routes/backups');
var clusters1cRoutes = require('./routes/clusters1c');
var routes = require('./routes/index');
var users = require('./routes/users');

// Create our Express application
var app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: path.join(__dirname, 'views/layouts/')}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/imd', imdRoutes);
app.use('/api/v1/scheme', schemeRoutes);
app.use('/api/v1/zones', zonesRoutes);
app.use('/api/v1/nodes', nodesRoutes);
app.use('/api/v1/servers', serversRoutes);
app.use('/api/v1/dbms-servers', dbmsServersRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/databases', databasesRoutes);
app.use('/api/v1/database-sizes', databaseSizesRoutes);
app.use('/api/v1/backups', backupsRoutes);
app.use('/api/v1/clusters1c', clusters1cRoutes);
app.use('/api/v1', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: (app.get('env') === 'development') ? err : {}
	});
});

module.exports = app;
