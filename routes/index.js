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

// Схема
var schemeRoute = router.route('/scheme');
var schemeTableRoute = router.route('/scheme/table');
// Зоны
var zonesRoute = router.route('/zones');
var zonesTableRoute = router.route('/zones/table');
var theZoneRoute = router.route('/zones/:zone_id');
// Ноды
var zonesNodesRoute = router.route('/zones/:zone_id/nodes');
var theZonesNodeRoute = router.route('/zones/:zone_id/nodes/:node_id');
var nodesRoute = router.route('/nodes');
var theNodeRoute = router.route('/nodes/:node_id');
// Серверы
var serversRoute = router.route('/servers');
var theServerRoute = router.route('/servers/:server_id');
// Серверы СУБД
var dbmsServersRoute = router.route('/dbms-servers');
var theDBMSServerRoute = router.route('/dbms-servers/:dbms_server_id');
// История изменений архитектуры
var historyRoute = router.route('/history');
var historyByDateRoute = router.route('/history/:date');
// Базы данных
var databasesRoute = router.route('/databases');
var databasesTableRoute = router.route('/databases/table/:date');
var theDatabaseRoute = router.route('/databases/:database_id');
var databasesSizesRoute = router.route('/database-sizes');
var databasesSizesByDateRoute = router.route('/database-sizes/:date');
// Архивы баз данных
var lastBackupsRoute = router.route('/backups/last');
var todayBackupsRoute = router.route('/backups/today');
var allBackupsRoute = router.route('/backups/all');

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
// /scheme
// ---------------------------------------------------------------------------------------------------------------------

// GET
schemeRoute.get(function (req, res) {
	var zone = models.Zone.build();

	zone.getScheme()
		.then(result => res.json(result))
		.catch(error => res.status(500).send(error));
});

// ---------------------------------------------------------------------------------------------------------------------
// /scheme/table
// ---------------------------------------------------------------------------------------------------------------------

// GET
schemeTableRoute.get(function (req, res) {
	var zone = models.Zone.build();
	var currentZone;
	var currentNode;
	var currentDatabase;
	var currentServer;

	var searchByName = function (array, name) {
		let result = null;
		array.forEach(item => {
			if (item.name === name) {
				result = item;
			}
		});
		return result;
	};

	// Вывести дату в формате dd.MM.yyyy
	var formatDate = function (date)  {
		return [
			date.getDate(),
			date.getMonth() + 1,
			date.getFullYear()
		].map(function(val){
			return val < 10 ? '0' + val : val;
		}).join('.');
	};

	zone.getScheme()
		.then(result => {
			let scheme = {
				zones: []
			};
			result.forEach(record => {
				currentZone = searchByName(scheme.zones, record.zone);
				if (!currentZone) {
					currentZone = {
						name: record.zone,
						nodes: []
					};
					scheme.zones.push(currentZone);
				}
				currentNode = searchByName(currentZone.nodes, record.node);
				if (!currentNode) {
					currentNode = {
						name: record.node,
						web_1: "",
						web_2: "",
						app_1: "",
						app_2: "",
						app_3: "",
						app_lic: "",
						db_1: "",
						db_2: "",
						databases: []
					};
					currentZone.nodes.push(currentNode);
				}
				if (record.database_name) {
					currentDatabase = searchByName(currentNode.databases, record.database_name);
					if (!currentDatabase) {
						currentDatabase = record.database_name;
						currentNode.databases.push(currentDatabase);
					}
				}
				switch (record.server_alias.toUpperCase()) {
					case "WEB-1":
						currentNode.web_1 = record.server_name;
						break;
					case "WEB-2":
						currentNode.web_2 = record.server_name;
						break;
					case "APP-1":
						currentNode.app_1 = record.server_name;
						break;
					case "APP-2":
						currentNode.app_2 = record.server_name;
						break;
					case "APP-3":
						currentNode.app_3 = record.server_name;
						break;
					case "APP-LIC":
						currentNode.app_lic = record.server_name;
						break;
					case "DB-1":
						currentNode.db_1 = record.server_name;
						break;
					case "DB-2":
						currentNode.db_2 = record.server_name;
				}
			});

			let resultTable = "<!DOCTYPE html>";
			resultTable += "<style>body{font-size:11px} .grey{background-color: #D8D8D8;} .yellow{background-color: #EDFF7F;} .white{background-color: #FFFFFF;} .green{background-color: #AFFEAF;} .red{background-color: #FEA5A5;}</style>";
			resultTable += "<h3>Ноды-базы УАИСБУ (" + formatDate(new Date()) + ")</h3>";
			resultTable += "<table width='100%' border='1' style='border-spacing: 0px;'>";
			resultTable += "<tr class='grey'>";
			resultTable += "<td>Зона</td><td>Нода</td><td>Базы</td>";
			for (let j = 1; j <= 2; j++) {
				resultTable += "<td style='width:250px'>WEB-?-" + j + "</td>";
			}
			for (let j = 1; j <= 3; j++) {
				resultTable += "<td style='width:250px'>APP-?-" + j + "</td>";
			}
			resultTable += "<td style='width:250px'>APP-LIC?</td>";
			for (let j = 1; j <= 2; j++) {
				resultTable += "<td style='width:250px'>DB-?-" + j + "</td>";
			}
			resultTable += "</tr>";
			scheme.zones.forEach(zone => {
				zone.nodes.forEach(node => {
					let databases = "";
					node.databases.forEach(database => {
						if (databases)
							databases += ", ";
						databases += database;
					});
					resultTable += "<tr>";
					resultTable += "<td>" + zone.name + "</td>";
					resultTable += "<td>" + node.name + "</td>";
					resultTable += "<td>" + databases + "</td>";
					resultTable += "<td>" + node.web_1 + "</td>";
					resultTable += "<td>" + node.web_2 + "</td>";
					resultTable += "<td>" + node.app_1 + "</td>";
					resultTable += "<td>" + node.app_2 + "</td>";
					resultTable += "<td>" + node.app_3 + "</td>";
					resultTable += "<td>" + node.app_lic + "</td>";
					resultTable += "<td>" + node.db_1 + "</td>";
					resultTable += "<td>" + node.db_2 + "</td>";
					resultTable += "</tr>";
				});
			});
			resultTable += "</table>";
			res.send(resultTable);
		})
		.catch(error => res.status(500).send(error));
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

// ---------------------------------------------------------------------------------------------------------------------
// /databases
// ---------------------------------------------------------------------------------------------------------------------

// GET
databasesRoute.get(function (req, res) {
	var database = models.Database.build();

	database.getAll(
		(result) => {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Databases not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// POST
databasesRoute.post(function (req, res) {
	var name = req.body.name;
	var recovery_model = req.body.recovery_model;
	var dbms_server_id = req.body.dbms_server_id;
	var database = models.Database.build({name: name, recovery_model: recovery_model});

	database.add(
		dbms_server_id,
		(result) => {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Database add fail");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// PUT
databasesRoute.put(function (req, res) {
	var name = req.body.name;
	var recovery_model = req.body.recovery_model;
	var dbms_server = models.DBMSServer.build();
	var database = models.Database.build({name: name, recovery_model: recovery_model});

	dbms_server.getByName(
		req.body.dbms_server,
		(dbms_servers) => {
			if ((dbms_servers) && (dbms_servers.length > 0)) {
				database.getByNameAndDBMSServer(
					name,
					dbms_servers[0].id,
					(databases) => {
						if ((databases) && (databases.length > 0)) {
							database.update(
								databases[0].id,
								dbms_servers[0].id,
								(result) => {
									if (result) {
										res.json(result);
									} else {
										res.status(401).send("Database update fail");
									}
								},
								(error) => res.status(500).send(error)
							);
						} else {
							database.add(
								dbms_servers[0].id,
								(result) => {
									if (result) {
										res.json(result);
									} else {
										res.status(401).send("Database add fail");
									}
								},
								(error) => res.status(500).send(error)
							);
						}
					},
					(error) => res.status(500).send(error)
				);
			} else {
				res.status(401).send("DBMS server not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /databases/table/:date
// ---------------------------------------------------------------------------------------------------------------------

// GET
databasesTableRoute.get(function(req, res) {
	var date = req.params.date;
	if (date == undefined) {
		res.status(406).send("Необходимо задать дату");
	}
	else {
		var zone = models.Zone.build();
		var currentZone;
		var currentNode;
		var currentDatabase;
		var currentServer;

		var searchByName = function (array, name) {
			let result = null;
			array.forEach(item => {
				if (item.name === name) {
					result = item;
				}
			});
			return result;
		};

		// Вывести дату в формате yyyyMMdd
		var formatDate_yyyyMMdd = function (date)  {
			return [
				date.getFullYear(),
				date.getMonth() + 1,
				date.getDate()
			].map(function(val){
				return val < 10 ? '0' + val : val;
			}).join('');
		};

		// Вывести дату в формате dd.MM.yyyy
		var formatDate_ddMMyyyy = function (date)  {
			return [
				date.getDate(),
				date.getMonth() + 1,
				date.getFullYear()
			].map(function(val){
				return val < 10 ? '0' + val : val;
			}).join('.');
		};

		let reportDate = new Date(date + 'T00:00:00');
		zone.getDBFileSizesSchemeByDate(formatDate_yyyyMMdd(reportDate))
			.then(result => {
				let scheme = {
					zones: []
				};
				result.forEach(record => {
					currentZone = searchByName(scheme.zones, record.zone);
					if (!currentZone) {
						currentZone = {
							name: record.zone,
							nodes: []
						};
						scheme.zones.push(currentZone);
					}
					currentNode = searchByName(currentZone.nodes, record.node);
					if (!currentNode) {
						currentNode = {
							name: record.node,
							databases: []
						};
						currentZone.nodes.push(currentNode);
					}
					currentDatabase = searchByName(currentNode.databases, record.database_name);
					if (!currentDatabase) {
						currentDatabase = {
							name: record.database_name,
							server: record.server_name,
							alias: '',
							dataFileSizeMB: record.data_file_size / 1024 / 1024,
							logFileSizeMB: record.log_file_size / 1024 / 1024,
							recoveryModel: ''
						};
						currentNode.databases.push(currentDatabase);
					}
					if (record.server_alias) {
						switch (record.server_alias.toUpperCase()) {
							case 'DB-1':
								currentDatabase.alias = 'DB-' + currentNode.name + '-1';
								break;
							case "DB-2":
								currentDatabase.alias = 'DB-' + currentNode.name + '-2';
						}
					}
					if (record.recovery_model) {
						switch (record.recovery_model.toUpperCase()) {
							case 'F':
								currentDatabase.recoveryModel = 'Full';
								break;
							case 'B':
								currentDatabase.recoveryModel = 'Bulk-logged';
								break;
							case 'S':
								currentDatabase.recoveryModel = 'Simple';
						}
					}
				});

				let resultTable = '<!DOCTYPE html>';
				resultTable += '<style>body{font-size:11px} .grey{background-color: #D8D8D8;} .yellow{background-color: #EDFF7F;} .white{background-color: #FFFFFF;} .green{background-color: #AFFEAF;} .red{background-color: #FEA5A5;}</style>';
				resultTable += '<h3>Отчет по базам данных УАИСБУ ' + formatDate_ddMMyyyy(reportDate) + '</h3>';
				scheme.zones.forEach(zone => {
					resultTable += '<li>' + zone.name + '</li>';
					resultTable += '<table width="100%" border="1" style="border-spacing: 0px;">';
					resultTable += '<tr class="grey">';
					resultTable += '<td>#</td><td>server</td><td>alias</td><td>dbname</td><td>DataFileSizeMB</td><td>LogFileSizeMB</td><td>Recovery</td></tr>';
					let counter = 0;
					zone.nodes.forEach(node => {
						node.databases.forEach(database => {
							counter++;
							switch (zone.name) {
								case 'Рабочая':
									resultTable += '<tr class="green">';
									break;
								case 'Системная':
									resultTable += '<tr class="green">';
									break;
								case 'Тестовая':
									resultTable += '<tr class="yellow">';
									break;
								case 'Разработка':
									resultTable += '<tr class="yellow">';
									break;
							}
							resultTable += '<td>' + counter + '</td>';
							resultTable += "<td>" + database.server + "</td>";
							resultTable += "<td>" + database.alias + "</td>";
							resultTable += "<td>" + database.name + "</td>";
							resultTable += "<td>" + database.dataFileSizeMB + "</td>";
							resultTable += "<td>" + database.logFileSizeMB + "</td>";
							resultTable += "<td>" + database.recoveryModel + "</td>";
							resultTable += "</tr>";
						});
					});
					resultTable += "</table>";
				});
				res.send(resultTable);
			})
			.catch(error => res.status(500).send(error));
	}
});

// ---------------------------------------------------------------------------------------------------------------------
// /databases/:database_id
// ---------------------------------------------------------------------------------------------------------------------

// GET
theDatabaseRoute.get(function(req, res) {
	var database = models.Database.build();

	database.getById(
		req.params.database_id,
		(result) => {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Database not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// PUT
theDatabaseRoute.put(function(req, res) {
	var name = req.body.name;
	var recovery_model = req.body.recovery_model;
	var dbms_server_id = req.body.dbms_server_id;
	var database = models.Database.build({name: name, recovery_model: recovery_model});

	database.update(
		req.params.database_id,
		dbms_server_id,
		(result) => {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Database update fail");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// DELETE
theDatabaseRoute.delete(function(req, res) {
	var database = models.Database.build();

	database.delete(
		req.params.database_id,
		(result) => {
			if (result) {
				res.json(result);
			} else {
				res.status(401).send("Database not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /database-sizes
// ---------------------------------------------------------------------------------------------------------------------

// PUT
databasesSizesRoute.put(function(req, res) {
	var date = req.body.date;
	var dbms_server_name = req.body.dbms_server;
	var database_name = req.body.database;
	var file_name = req.body.file_name;
	var file_type = req.body.file_type;
	var file_size = req.body.file_size;
	var dbfilesizeshistory = models.DBFileSizesHistory.build({
		date: date,
		file_name: file_name,
		file_type: file_type,
		file_size: file_size
	});
	var dbms_server = models.DBMSServer.build();
	var database = models.Database.build();

	dbms_server.getByName(
		dbms_server_name,
		(dbms_servers) => {
			if ((dbms_servers) && (dbms_servers.length > 0)) {
				database.getByNameAndDBMSServer(
					database_name,
					dbms_servers[0].id,
					(databases) => {
						if ((databases) && (databases.length > 0)) {
							dbfilesizeshistory.getId(
								databases[0].id,
								(ids) => {
									if ((ids) && (ids.length > 0)) {
										dbfilesizeshistory.updateSize(
											ids[0].id,
											(result) => res.status(200).send('Ok'),
											(error) => res.status(500).send(error)
										);
									} else {
										dbfilesizeshistory.add(
											databases[0].id,
											(result) => {
												if (result) {
													res.json(result);
												} else {
													res.status(401).send("Database file size history add fail");
												}
											},
											(error) => res.status(500).send(error)
										);
									}
								},
								(error) => res.status(500).send(error)
							)
						} else {
							res.status(401).send("Database '" + database_name + "' on DBMS server '" + dbms_server_name + "' not found");
						}
					},
					(error) => res.status(500).send(error)
				);
			} else {
				res.status(401).send("DBMS server '" + dbms_server_name + "' not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /database-sizes/:date
// ---------------------------------------------------------------------------------------------------------------------

// GET
databasesSizesByDateRoute.get(function(req, res) {
	// Контроль указания даты в параметрах либо в теле запроса.
	var date = req.params.date;
	if (date == undefined) {
		res.status(406).send("Необходимо задать дату");
	}
	else {
		var dbfilesizeshistory = models.DBFileSizesHistory.build();

		dbfilesizeshistory.getAllByDate(
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

// ---------------------------------------------------------------------------------------------------------------------
// /backups/last
// ---------------------------------------------------------------------------------------------------------------------

// PUT
lastBackupsRoute.put(function (req, res) {
	var file_name = req.body.file_name;
	var database_id = req.body.database_id;
	var backup_date = req.body.backup_date;
	var backup_type = req.body.backup_type;
	var backup_size = req.body.backup_size;
	var lastBackup = models.LastBackup.build({
		file_name: file_name,
		backup_date: backup_date,
		backup_type: backup_type,
		backup_size: backup_size
	});

	lastBackup.getByDatabaseId(
		database_id,
		(backups) => {
			if ((backups) && (backups.length > 0)) {
				lastBackup.update(
					database_id,
					(result) => {
						if (result) {
							res.json(result);
						} else {
							res.status(401).send("Last backup update fail");
						}
					},
					(error) => res.status(500).send(error)
				);
			} else {
				lastBackup.add(
					database_id,
					(result) => {
						if (result) {
							res.json(result);
						} else {
							res.status(401).send("Last backup add fail");
						}
					},
					(error) => res.status(500).send(error)
				);
			}
		},
		(error) => res.status(500).send(error)
	);
});

// GET
lastBackupsRoute.get(function (req, res) {
	var lastBackup = models.LastBackup.build();

	lastBackup.getAll(
		function(backups) {
			if (backups) {
				res.json(backups);
			} else {
				res.status(401).send("Backups not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /backups/today
// ---------------------------------------------------------------------------------------------------------------------

// GET
todayBackupsRoute.get(function (req, res) {
	res.send("Under construction"); // ToDo /backups/today
});

// ---------------------------------------------------------------------------------------------------------------------
// /backups/all
// ---------------------------------------------------------------------------------------------------------------------

// GET
allBackupsRoute.get(function (req, res) {
	res.send("Under construction"); // ToDo /backups/all
});

module.exports = router;
