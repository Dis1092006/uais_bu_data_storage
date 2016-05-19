"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var databasesRoute = router.route('/');
var databasesTableRoute = router.route('/table/:date');
var theDatabaseRoute = router.route('/:database_id');

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
				resultTable += '<style>.grey{background-color: #D8D8D8;} .yellow{background-color: #EDFF7F;} .white{background-color: #FFFFFF;} .green{background-color: #AFFEAF;} .red{background-color: #FEA5A5;}</style>';
				resultTable += '<h3>Отчет по базам данных УАИС БУ ' + formatDate_ddMMyyyy(reportDate) + '</h3>';
				scheme.zones.forEach(zone => {
					resultTable += '<li>' + zone.name + '</li>';
					resultTable += '<table width="100%" border="1" style="border-spacing: 0px; font-size: 11px">';
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

module.exports = router;