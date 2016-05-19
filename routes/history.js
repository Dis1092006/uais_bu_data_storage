"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var historyRoute = router.route('/');
var historyByDateRoute = router.route('/:date');

// ---------------------------------------------------------------------------------------------------------------------
// /history
// ---------------------------------------------------------------------------------------------------------------------

// POST
historyRoute.post(function (req, res) {
	var date = req.body.date;
	var zoneName = req.body.zone;
	var nodeName = req.body.node;
	var serverName = req.body.server;
	var history = models.History.build({date: date});

	// ToDo: сделать валидацию

	// Искомые ключи.
	var zoneId = 0;
	var nodeId = 0;
	var serverId = 0;

	// Поиск ключей.
	var zone = models.Zone.build();
	var node = models.Node.build();
	var server = models.Server.build();

	// zone.getByName(
	// 	zoneName,
	// 	function(zones) {
	// 		if ((zones) && (zones.length > 0)) {
	// 			zoneId = zones[0].id;
	// 			node.getByName(
	// 				nodeName,
	// 				function(nodes) {
	// 					if ((nodes) && (nodes.length > 0)) {
	// 						nodeId = nodes[0].id;
	// 						server.getByName(
	// 							serverName,
	// 							function(servers) {
	// 								if ((servers) && (servers.length > 0)) {
	// 									serverId = servers[0].id;
	// 									console.log("zoneId = " + zoneId + ", nodeId = " + nodeId + ", serverId = " + serverId);
	// 									if ((zoneId !== 0) && (nodeId !== 0) && (serverId !== 0)) {
	// 										history.add(
	// 											zoneId,
	// 											nodeId,
	// 											serverId,
	// 											function(history) {
	// 												if (history) {
	// 													res.json(history);
	// 												} else {
	// 													res.status(500).send("History add fail");
	// 												}
	// 											},
	// 											function(error) {
	// 												res.status(500).send(error);
	// 											}
	// 										);
	// 									}
	// 								} else {
	// 									res.send(401, "Server '" + serverName + "' not found");
	// 								}
	// 							},
	// 							function(error) {
	// 								res.send(500, error);
	// 							}
	// 						);
	// 					} else {
	// 						res.send(401, "Node '" + nodeName + "' not found");
	// 					}
	// 				},
	// 				function(error) {
	// 					res.send(500, error);
	// 				}
	// 			);
	// 		} else {
	// 			res.send(401, "Zone '" + zoneName + "' not found");
	// 		}
	// 	},
	// 	function(error) {
	// 		res.send(500, error);
	// 	}
	// );
});

// ---------------------------------------------------------------------------------------------------------------------
// /history/:date
// ---------------------------------------------------------------------------------------------------------------------

// GET
historyByDateRoute.get(function (req, res) {
	// Контроль указания даты в параметрах либо в теле запроса.
	var date = req.params.date;
	if (date == undefined) {
		res.status(406).send("Необходимо задать дату");
	}
	else {
		var history = models.History.build({date: date});

		history.getAllByDate(
			date,
			function(history) {
				if (history) {
					res.json(history);
				} else {
					res.status(401).send("History not found");
				}
			},
			function(error) {
				res.status(500).send(error);
			}
		);
	}
});

module.exports = router;