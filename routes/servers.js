"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var serversRoute = router.route('/');
var theServerRoute = router.route('/:server_id');

// ---------------------------------------------------------------------------------------------------------------------
// /servers
// ---------------------------------------------------------------------------------------------------------------------

// GET
serversRoute.get(function (req, res) {
	let serverModel = models.Server.build();
	let zoneModel = models.Zone.build();
	let nodeModel = models.Node.build();

	// Анализ параметров.
	let server_name = req.query.name;
	let server_alias = req.query.alias;
	let zone_id = 0;
	let node_id = 0;

	// Асинхронное получение zone_id.
	let promiseZoneId = new Promise((resolve, reject) => {
		if (req.query.zone) {
			zoneModel.getByNameOrByID(req.query.zone, false, false)
				.then(zone => {
					zone_id = zone.id;
					resolve(zone_id);
				})
				.catch(error => reject(error))
		}
		else {
			resolve(0);
		}
	});
	promiseZoneId
		.then(zone_id => {
			// Асинхронное получение nodeId.
			return new Promise((resolve, reject) => {
				if (req.query.node) {
					nodeModel.getByNameOrByID(req.query.node, zone_id, false, false)
						.then(node => {
							node_id = node.id;
							resolve(node_id);
						})
						.catch(error => reject(error))
				}
				else {
					resolve(0);
				}
			})
		})
		.then(node_id => {

			console.log("name = " + server_name);
			console.log("alias = " + server_alias);
			console.log("zone_id = " + zone_id);
			console.log("node_id = " + node_id);

			// Подготовка фильтра.
			let filter = "";
			if (server_name) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "name like N'%" + server_name + "%'";
			}
			if (server_alias) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "alias like N'%" + server_alias + "%'";
			}
			if (zone_id) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "zone_id = " + zone_id;
			}
			if (node_id) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "node_id = " + node_id;
			}

			// Если задан хотя бы один параметр, то будет поиск с условием.
			if (filter !== "") {
				serverModel.getByFilter(
					filter,
					servers => {
						if (servers) {
							res.json(servers);
						} else {
							res.status(401).send("Servers not found");
						}
					},
					error => res.status(500).send(error)
				);
			}
			// Иначе - простая выборка всех серверов.
			else {
				serverModel.getAll(
					servers => {
						if (servers) {
							res.json(servers);
						} else {
							res.status(401).send("Servers not found");
						}
					},
					error => res.status(500).send(error)
				);
			}
		})
		.catch(error => res.status(500).send(error.message));
});

// PUT
serversRoute.put(function (req, res) {
	let server_name = req.body.name;
	let server_alias = req.body.alias;
	let zone_name = req.body.zone;
	let node_name = req.body.node;

	let zoneModel = models.Zone.build();
	let nodeModel = models.Node.build();
	let serverModel = models.Server.build({name: server_name, alias: server_alias});

	let zone_id = null;
	let node_id = null;
	zoneModel.getByNameOrByID(zone_name, true, true)
		.then(the_zone => {
			if (the_zone)
				zone_id = the_zone.id;
			return nodeModel.getByNameOrByID(node_name, zone_id, true, true);
		})
		.then(the_node => {
			if (the_node)
				node_id = the_node.id;
			// Подготовка фильтра.
			let filter = "";
			if (server_name) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "name like N'%" + server_name + "%'";
			}
			if (zone_id) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "zone_id = " + zone_id;
			}
			if (node_id) {
				if (filter !== "") {
					filter += " AND ";
				}
				filter += "node_id = " + node_id;
			}
			serverModel.getByFilter(
				filter,
				servers => {
					if ((servers) && (servers.length > 0)) {
						if (servers.length == 1) {
							serverModel.update(
								servers[0].id,
								zone_id,
								node_id,
								(servers) => {
									if (servers) {
										res.json(servers);
									} else {
										res.status(500).send("Server update fail");
									}
								},
								(error) => res.status(500).send(error.message)
							);
						} else {
							res.status(400).send("Too many servers for this request");
						}
					} else {
						serverModel.add(
							zone_id,
							node_id,
							(servers) => {
								if (servers) {
									res.json(servers);
								} else {
									res.status(500).send("Server add fail");
								}
							},
							(error) => res.status(500).send(error.message)
						);
					}
				},
				error => res.status(500).send(error)
			);
		});
});

// ---------------------------------------------------------------------------------------------------------------------
// /servers/:server_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theServerRoute.get(function(req, res) {
	var server = models.Server.build();

	server.getById(
		req.params.server_id,
		(servers) => {
			if (servers) {
				res.json(servers);
			} else {
				res.status(401).send("Server not found");
			}
		},
		(error) => res.status(500).send(error)
	);
})

// PUT
theServerRoute.put(function(req, res) {
	var name = req.body.name;
	var alias = req.body.alias;
	var zone_id = req.body.zone_id;
	var node_id = req.body.node_id;
	var server = models.Server.build({name: name, alias: alias});

	server.update(
		req.params.server_id,
		zone_id,
		node_id,
		(servers) => {
			if (servers) {
				res.json(servers);
			} else {
				res.status(500).send("Server update fail");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// DELETE
theServerRoute.delete(function(req, res) {
	var server = models.Server.build();

	server.delete(
		req.params.server_id,
		(servers) => {
			if (servers) {
				res.json(servers);
			} else {
				res.status(401).send("Server not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

module.exports = router;