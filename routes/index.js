"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var internalMonitoringData = require('../internal-monitoring-data');

router.get('/', function (req, res, next) {
	res.json({message: 'Get is working!'});
});

// Данные мониторинга web-сервисов
var imdRoute = router.route('/imd');

// Зоны
var zonesRoute = router.route('/zones');
var zonesTableRoute = router.route('/zones/table');
// Ноды
var zonesNodesRoute = router.route('/zones/:zone_id/nodes');
var theZonesNodeRoute = router.route('/zones/:zone_id/nodes/:node_id');
var nodesRoute = router.route('/nodes');
var theNodeRoute = router.route('/nodes/:node_id');
// Серверы
var serversRoute = router.route('/servers');
var theServerRoute = router.route('/servers/:server_id');
// История изменений архитектуры
var historyRoute = router.route('/history');
var historyByDateRoute = router.route('/history/:date');

// ---------------------------------------------------------------------------------------------------------------------
// /imd
// ---------------------------------------------------------------------------------------------------------------------

// Create endpoint /imd for POST
imdRoute.post(function (req, res) {
	var imd = new internalMonitoringData();
	var time, duration, address, status, error;

    //// текущая дата
    //var now = new Date().toISOString();

	// Разбор полученных данных.
	time = req.body.time;
	duration = req.body.duration;
	address = req.body.address;
	status = req.body.status;
	error = req.body.error;

    // Контроль показателей.
    if (time === null ||duration === null || address === null || status === null) {
        res.json({message: "Некорректные данные!"});
        console.log("Некорректные данные!");
        console.log(req.body);
    }
    else if (time === "") {
        res.json({message: "Некорректные показатели времени в данных!"});
        console.log("Некорректные показатели времени в данных!");
        console.log(req.body);
    }
    else {
        var result = imd.add(time, duration, address, status, error, function (result) {
            res.json({message: result});
        });
    }
});

// Create endpoint /imd for GET
imdRoute.get(function (req, res) {
	var imd = new internalMonitoringData();
	var result = imd.get_current(function (result) {
		res.json({message: result});
	});
});

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
			zoneModel.getByNameOrByID(req.query.zone, false)
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
					nodeModel.getByNameOrByID(req.query.node, zone_id, false)
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

// POST
serversRoute.post(function (req, res) {
	var name = req.body.name;
	var alias = req.body.alias;
	var zone = req.body.zone;
	var node = req.body.node;
	var server = models.Server.build({name: name, alias: alias});

	server.add(
		models,
		zone,
		node,
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.status(500).send("Server add fail");
			}
		},
		function(error) {
			res.status(500).send(error.message);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /servers/:server_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theServerRoute.get(function(req, res) {
	var server = models.Server.build();

	server.getById(
		req.params.server_id,
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.status(401).send("Server not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
})

// PUT
theServerRoute.put(function(req, res) {
	var name = req.body.name;
	var alias = req.body.alias;
	var server = models.Server.build({name: name, alias: alias});

	server.update(
		req.params.server_id,
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.status(500).send("Server update fail");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// DELETE
theServerRoute.delete(function(req, res) {
	var server = models.Server.build();

	server.delete(
		req.params.server_id,
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.status(401).send("Server not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

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
