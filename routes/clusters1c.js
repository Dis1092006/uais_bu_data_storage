"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var lostedRPHostsRoute = router.route('/losted-rphosts');
var lostedRPHostsForServerRoute = router.route('/losted-rphosts/:server');

// ---------------------------------------------------------------------------------------------------------------------
// /clusters1c/losted-rphosts
// ---------------------------------------------------------------------------------------------------------------------

// POST
lostedRPHostsRoute.post(function (req, res) {
	var cluster = req.body.cluster;
	var server = req.body.server;
	var rphosts = req.body.rphosts;
	var lostedRPHost = models.LostedRPHost.build({cluster: cluster, server: server, rphosts: rphosts});

	lostedRPHost.add(
		function(result){
			if (result) {
				res.json(result);
			} else {
				res.status(500).send("Losted rphosts add fail");
			}
		},
		function(error) {
			res.status(500).send(error);
		});
});

// GET
lostedRPHostsRoute.get(function (req, res) {
	var lostedRPHost = models.LostedRPHost.build();

	lostedRPHost.getAll(
		function(result) {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Losted rphosts not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// DELETE
lostedRPHostsForServerRoute.delete(function (req, res) {
	var server = req.params.server;
	var lostedRPHost = models.LostedRPHost.build();

	lostedRPHost.delete(
		server,
		function(result) {
			if (result) {
				res.json(result);
			} else {
				res.status(200).send("Losted rphosts is absent");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

module.exports = router;