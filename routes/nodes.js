"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var nodesRoute = router.route('/');
var theNodeRoute = router.route('/:node_id');

// ---------------------------------------------------------------------------------------------------------------------
// /nodes
// ---------------------------------------------------------------------------------------------------------------------

// GET
nodesRoute.get(function (req, res) {
	var node = models.Node.build();
	
	node.getAll(
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

// ---------------------------------------------------------------------------------------------------------------------
// /nodes/:node_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theNodeRoute.get(function(req, res) {
	var node = models.Node.build();
	
	node.getById(req.params.node_id)
		.then(nodes => {
			if (nodes) {
				res.json(nodes);
			} else {
				res.status(401).send("Node not found");
			}
		})
		.catch(error => {
			res.status(500).send(error);
		})
});

// PUT
theNodeRoute.put(function(req, res) {
	var name = req.body.name;
	var node = models.Node.build({name: name});
	
	node.update(
		req.params.node_id,
		function(nodes) {
			if (nodes) {
				res.json(nodes);
			} else {
				res.status(500).send("Node update fail");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// DELETE
theNodeRoute.delete(function(req, res) {
	var node = models.Node.build();
	
	node.delete(
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