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
				res.send(401, "Zone not found");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(401, "Node not found");
			}
		},
		function (error) {
			res.send(500, error);
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
				res.send(500, "Node add fail");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(401, "Node not found");
			}
		},
		function(error) {
			res.send(500, error);
		}
	);
})

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
				res.send(401, "Node not found");
			}
		},
		function (error) {
			res.send(500, error);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /nodes/:node_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theNodeRoute.get(function(req, res) {
	var node = models.Node.build();

	node.getById(
		req.params.node_id,
		function(nodes) {
			if (nodes) {
				res.json(nodes);
			} else {
				res.send(401, "Node not found");
			}
		},
		function(error) {
			res.send(500, error);
		}
	);
})

// PUT
theNodeRoute.put(function(req, res) {
	var name = req.body.name;
	var alias = req.body.alias;
	var node = models.Node.build({name: name, alias: alias});

	node.update(
		req.params.node_id,
		function(nodes) {
			if (nodes) {
				res.json(nodes);
			} else {
				res.send(500, "Node update fail");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(401, "Node not found");
			}
		},
		function(error) {
			res.send(500, error);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /servers
// ---------------------------------------------------------------------------------------------------------------------

// GET
serversRoute.get(function (req, res) {
	var server = models.Server.build();

	server.getAll(
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.send(401, "Server not found");
			}
		},
		function(error) {
			res.send(500, error);
		}
	);
});

// POST
serversRoute.post(function (req, res) {
	var name = req.body.name;
	var alias = req.body.alias;
	var server = models.Server.build({name: name, alias: alias});

	server.add(
		function(servers) {
			if (servers) {
				res.json(servers);
			} else {
				res.send(500, "Server add fail");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(401, "Server not found");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(500, "Server update fail");
			}
		},
		function(error) {
			res.send(500, error);
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
				res.send(401, "Server not found");
			}
		},
		function(error) {
			res.send(500, error);
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

	zone.getByName(
		zoneName,
		function(zones) {
			if ((zones) && (zones.length > 0)) {
				zoneId = zones[0].id;
				node.getByName(
					nodeName,
					function(nodes) {
						if ((nodes) && (nodes.length > 0)) {
							nodeId = nodes[0].id;
							server.getByName(
								serverName,
								function(servers) {
									if ((servers) && (servers.length > 0)) {
										serverId = servers[0].id;
										console.log("zoneId = " + zoneId + ", nodeId = " + nodeId + ", serverId = " + serverId);
										if ((zoneId !== 0) && (nodeId !== 0) && (serverId !== 0)) {
											history.add(
												zoneId,
												nodeId,
												serverId,
												function(history) {
													if (history) {
														res.json(history);
													} else {
														res.status(500).send("History add fail");
													}
												},
												function(error) {
													res.status(500).send(error);
												}
											);
										}
									} else {
										res.send(401, "Server '" + serverName + "' not found");
									}
								},
								function(error) {
									res.send(500, error);
								}
							);
						} else {
							res.send(401, "Node '" + nodeName + "' not found");
						}
					},
					function(error) {
						res.send(500, error);
					}
				);
			} else {
				res.send(401, "Zone '" + zoneName + "' not found");
			}
		},
		function(error) {
			res.send(500, error);
		}
	);
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
