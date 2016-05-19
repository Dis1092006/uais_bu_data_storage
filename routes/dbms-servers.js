"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var dbmsServersRoute = router.route('/');
var theDBMSServerRoute = router.route('/:dbms_server_id');

// ---------------------------------------------------------------------------------------------------------------------
// /dbms-servers
// ---------------------------------------------------------------------------------------------------------------------

// GET
dbmsServersRoute.get(function (req, res) {
	var dbms_server = models.DBMSServer.build();
	
	dbms_server.getAll(
		function(dbms_servers) {
			if (dbms_servers) {
				res.json(dbms_servers);
			} else {
				res.status(401).send("DBMS Server not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// POST
dbmsServersRoute.post(function (req, res) {
	var instance_name = req.body.instance_name;
	var port = req.body.port;
	var user = req.body.user;
	var password = req.body.password;
	var server_id = req.body.server_id;
	var dbms_server = models.DBMSServer.build({
		instance_name: instance_name,
		port: port,
		user: user,
		password: password
	});
	
	dbms_server.add(
		server_id,
		function(dbms_servers) {
			if (dbms_servers) {
				res.json(dbms_servers);
			} else {
				res.status(500).send("DBMS server add fail");
			}
		},
		function(error) {
			res.status(500).send(error.message);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /dbms-servers/:dbms_server_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theDBMSServerRoute.get(function(req, res) {
	var dbms_server = models.DBMSServer.build();
	
	dbms_server.getById(
		req.params.dbms_server_id,
		function(dbms_servers) {
			if (dbms_servers) {
				res.json(dbms_servers);
			} else {
				res.status(401).send("DBMS server not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
})

// PUT
theDBMSServerRoute.put(function(req, res) {
	var instance_name = req.body.instance_name;
	var port = req.body.port;
	var user = req.body.user;
	var password = req.body.password;
	var dbms_server = models.DBMSServer.build({
		instance_name: instance_name,
		port: port,
		user: user,
		password: password
	});
	
	dbms_server.update(
		req.params.dbms_server_id,
		function(dbms_servers) {
			if (dbms_servers) {
				res.json(dbms_servers);
			} else {
				res.status(500).send("DBMS server update fail");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// DELETE
theDBMSServerRoute.delete(function(req, res) {
	var dbms_server = models.DBMSServer.build();
	
	dbms_server.delete(
		req.params.dbms_server_id,
		function(dbms_servers) {
			if (dbms_servers) {
				res.json(dbms_servers);
			} else {
				res.status(401).send("DBMS server not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

module.exports = router;