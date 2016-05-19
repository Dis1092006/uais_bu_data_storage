"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var zonesRoute = router.route('/');
var zonesTableRoute = router.route('/table');
var theZoneRoute = router.route('/:zone_id');
var zonesNodesRoute = router.route('/:zone_id/nodes');
var theZonesNodeRoute = router.route('/:zone_id/nodes/:node_id');

// ---------------------------------------------------------------------------------------------------------------------
// /zones
// ---------------------------------------------------------------------------------------------------------------------

// GET
zonesRoute.get(function (req, res) {
	var zone = models.Zone.build();

	zone.getAll(
		function(zones) {
			if (zones) {
				res.json(zones);
			} else {
				res.status(401).send("Zone not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /zones/table
// ---------------------------------------------------------------------------------------------------------------------

// GET
zonesTableRoute.get(function (req, res) {
	models.Zone.findAll({
		include: [ models.Node ]
	}).then(function(zones) {
		res.render('index', {
			title: 'Зоны-Ноды',
			zones: zones
		});
	});
});

// ---------------------------------------------------------------------------------------------------------------------
// /zones/:zone_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theZoneRoute.get(function (req, res) {
	var zone = models.Zone.build();

	zone.getById(req.params.zone_id)
		.then(zone => {
			if (zone) {
				res.json(zone);
			} else {
				res.status(401).send("Zone not found");
			}
		})
		.catch(error => res.status(500).send(error));
});

// ---------------------------------------------------------------------------------------------------------------------
// /zones/:zone_id/nodes
// ---------------------------------------------------------------------------------------------------------------------

// GET
zonesNodesRoute.get(function (req, res) {
	var node = models.Node.build();

	node.getAllByZone(
		req.params.zone_id,
		function (nodes) {
			if (nodes) {
				res.json(nodes);
			} else {
				res.status(401).send("Node not found");
			}
		},
		function (error) {
			res.status(500).send(error);
		}
	);
});

// POST
zonesNodesRoute.post(function (req, res) {
	var name = req.body.name;
	var node = models.Node.build({name: name});

	node.add(
		req.params.zone_id,
		function(nodes){
			if (nodes) {
				res.json(nodes);
			} else {
				res.status(500).send("Node add fail");
			}
		},
		function(error) {
			res.status(500).send(error);
		});
});

// ---------------------------------------------------------------------------------------------------------------------
// /zones/:zone_id/nodes/:node_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theZonesNodeRoute.get(function(req, res) {
	var node = models.Node.build();

	node.getById(
		req.params.node_id,
		function(nodes) {
			if (nodes) {
				res.json(nodes);
			} else {
				res.status(401).send("Node not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

module.exports = router;